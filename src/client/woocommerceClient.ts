import type { RuntimeConfig } from '../config/config.js';
import { ConnectorError } from '../errors/categories.js';
import { createLogger } from '../observability/logger.js';
import { classifyWooError, normalizeRetryDelay, shouldRetryRequest } from './errorClassifier.js';

const ALLOWED_WOO_PATHS = new Set([
  'orders',
  'products',
]);

export type WooRequestOptions = {
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
};

export type WooCommerceClientConfig = Partial<RuntimeConfig> & { timeoutMs?: number };

export class WooCommerceClient {
  private readonly requestId: string;
  private readonly logger = createLogger();

  constructor(private readonly config: WooCommerceClientConfig) {
    this.requestId = `wc-${Math.random().toString(36).slice(2, 10)}`;
  }

  getRequestId(): string {
    return this.requestId;
  }

  get baseUrl(): string {
    return this.config.storeUrl ?? 'https://example-store.local';
  }

  private get timeoutMs(): number {
    return this.config.timeoutMs ?? this.config.requestTimeoutMs ?? 10000;
  }

  private buildUrl(path: string, params: Record<string, string | number | boolean | undefined> = {}): URL {
    const sanitizedPath = path.replace(/^\/+/u, '').replace(/\/+/gu, '/');
    const allowed = Array.from(ALLOWED_WOO_PATHS).some((entry) => sanitizedPath === entry || sanitizedPath.startsWith(`${entry}/`));
    if (!allowed) {
      throw new ConnectorError({
        category: 'AUTHORIZATION_ERROR',
        message: 'Unsupported WooCommerce endpoint for read-only connector.',
        retryable: false,
        statusCode: 403,
      });
    }

    const url = new URL('/wp-json/wc/v3/', this.baseUrl);
    url.pathname = `/wp-json/wc/v3/${sanitizedPath}`;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  private buildHeaders(): Headers {
    const auth = Buffer.from(`${this.config.consumerKey ?? 'demo'}:${this.config.consumerSecret ?? 'demo'}`).toString('base64');
    return new Headers({
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  async get<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
    const url = this.buildUrl(path, params);
    const startedAt = Date.now();
    const maxRetries = this.config.maxRetries ?? 3;
    const initialBackoffMs = this.config.initialBackoffMs ?? 250;
    const maxBackoffMs = this.config.maxBackoffMs ?? 4000;
    let lastError: { status?: number; code?: string; message?: string } | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.buildHeaders(),
          signal: controller.signal,
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') ?? undefined;
          const delayMs = normalizeRetryDelay(retryAfter ?? undefined, attempt, initialBackoffMs, maxBackoffMs);
          this.logger.warn({ requestId: this.requestId, toolName: 'woo_http_get', operation: 'get', durationMs: Date.now() - startedAt, status: response.status, retryCount: attempt - 1 }, '429 received; retrying after backoff');
          if (attempt >= maxRetries + 1) {
            throw new ConnectorError({
              category: 'RATE_LIMITED',
              message: 'WooCommerce rate limit exceeded.',
              retryable: false,
              statusCode: response.status,
            });
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (response.ok) {
          this.logger.info({ requestId: this.requestId, toolName: 'woo_http_get', operation: 'get', durationMs: Date.now() - startedAt, status: response.status, retryCount: attempt - 1 }, 'WooCommerce request completed');
          const parsed = (await response.json()) as T;
          return parsed;
        }

        lastError = { status: response.status, message: await response.text() };
        const category = classifyWooError(lastError);
        if (!shouldRetryRequest(lastError, attempt, maxRetries)) {
          this.logger.error({ requestId: this.requestId, toolName: 'woo_http_get', operation: 'get', durationMs: Date.now() - startedAt, status: response.status, retryCount: attempt - 1, category: category.category }, 'WooCommerce request failed');
          throw new ConnectorError({
            category: category.category,
            message: category.message,
            retryable: category.retryable,
            statusCode: response.status,
          });
        }

        const backoff = normalizeRetryDelay(undefined, attempt, initialBackoffMs, maxBackoffMs);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      } catch (error) {
        if (error instanceof ConnectorError) {
          throw error;
        }

        if ((error as Error).name === 'AbortError') {
          lastError = { status: 408, code: 'TIMEOUT', message: 'Request timed out' };
          const classified = classifyWooError(lastError);
          if (shouldRetryRequest(lastError, attempt, maxRetries)) {
            const backoff = normalizeRetryDelay(undefined, attempt, initialBackoffMs, maxBackoffMs);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          throw new ConnectorError({
            category: classified.category,
            message: classified.message,
            retryable: classified.retryable,
            statusCode: 408,
          });
        }

        lastError = { code: 'NETWORK_ERROR', message: (error as Error).message };
        const classified = classifyWooError(lastError);
        if (shouldRetryRequest(lastError, attempt, maxRetries)) {
          const backoff = normalizeRetryDelay(undefined, attempt, initialBackoffMs, maxBackoffMs);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw new ConnectorError({
          category: classified.category,
          message: classified.message,
          retryable: classified.retryable,
          statusCode: 0,
        });
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    const classifiedFinal = classifyWooError(lastError ?? { message: 'Unknown request failure' });
    throw new ConnectorError({
      category: classifiedFinal.category,
      message: classifiedFinal.message,
      retryable: classifiedFinal.retryable,
      statusCode: lastError?.status,
    });
  }

  async simulateRateLimitScenario(): Promise<{ status: number; attempts: number; retryCount: number }> {
    let attempts = 0;
    let retryCount = 0;
    const responses = [429, 200];
    const response = await new Promise<{ status: number }>((resolve) => {
      const step = () => {
        attempts += 1;
        const nextStatus = responses[attempts - 1] ?? 200;
        if (nextStatus === 429) {
          retryCount += 1;
          setTimeout(() => {
            this.logger.warn({ requestId: this.requestId, toolName: 'demo_rate_limit', operation: 'simulateRateLimit', retryCount }, '429 received');
            step();
          }, 50);
          return;
        }

        resolve({ status: nextStatus });
      };
      step();
    });

    return { status: response.status, attempts, retryCount };
  }
}
