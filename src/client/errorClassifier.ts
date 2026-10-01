import type { ErrorCategory } from '../errors/categories.js';

export type ClassifiedWooError = {
  category: ErrorCategory;
  retryable: boolean;
  message: string;
  statusCode?: number;
};

export function classifyWooError(input: { status?: number; code?: string; message?: string }): ClassifiedWooError {
  const status = input.status ?? 0;
  const message = input.message ?? 'Request failed';

  if (status === 401) {
    return { category: 'AUTHENTICATION_ERROR', retryable: false, message, statusCode: status };
  }

  if (status === 403) {
    return { category: 'AUTHORIZATION_ERROR', retryable: false, message, statusCode: status };
  }

  if (status === 400 || status === 422) {
    return { category: 'VALIDATION_ERROR', retryable: false, message, statusCode: status };
  }

  if (status === 404) {
    return { category: 'NOT_FOUND', retryable: false, message, statusCode: status };
  }

  if (status === 429) {
    return { category: 'RATE_LIMITED', retryable: true, message: 'Rate limit reached', statusCode: status };
  }

  if (status === 500 || status === 502 || status === 503) {
    return { category: 'UPSTREAM_ERROR', retryable: true, message, statusCode: status };
  }

  if (input.code === 'ECONNRESET' || input.code === 'ENOTFOUND' || input.code === 'ECONNREFUSED') {
    return { category: 'NETWORK_ERROR', retryable: true, message: input.code ?? 'Network error' };
  }

  if (/timeout/i.test(message)) {
    return { category: 'TIMEOUT', retryable: true, message, statusCode: status };
  }

  return { category: 'UNKNOWN_ERROR', retryable: false, message, statusCode: status };
}

export function shouldRetryRequest(
  error: { status?: number; code?: string; message?: string },
  attempt: number,
  maxRetries: number,
): boolean {
  const classified = classifyWooError(error);
  if (attempt >= maxRetries) {
    return false;
  }
  if (!classified.retryable) {
    return false;
  }

  return classified.category !== 'AUTHENTICATION_ERROR' && classified.category !== 'AUTHORIZATION_ERROR';
}

export function normalizeRetryDelay(
  retryAfter: number | string | undefined,
  attempt: number,
  initialBackoffMs: number,
  maxBackoffMs: number,
): number {
  if (retryAfter !== undefined && retryAfter !== null && retryAfter !== '') {
    const parsed = typeof retryAfter === 'number' ? retryAfter : Number.parseInt(retryAfter, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : initialBackoffMs * 2 ** Math.max(0, attempt - 1);
  }

  const exponentialDelay = initialBackoffMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(Math.max(0, exponentialDelay), maxBackoffMs);
}
