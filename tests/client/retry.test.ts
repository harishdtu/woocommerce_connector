import { describe, expect, it } from 'vitest';
import { classifyWooError, normalizeRetryDelay, shouldRetryRequest } from '../../src/client/errorClassifier.js';
import { WooCommerceClient } from '../../src/client/woocommerceClient.js';

describe('HTTP resilience', () => {
  it('classifies authentication errors', () => {
    expect(classifyWooError({ status: 401, message: 'Unauthorized' }).category).toBe('AUTHENTICATION_ERROR');
  });

  it('classifies rate-limit errors', () => {
    expect(classifyWooError({ status: 429, message: 'Too many requests' }).category).toBe('RATE_LIMITED');
  });

  it('classifies upstream errors', () => {
    expect(classifyWooError({ status: 503, message: 'Service unavailable' }).category).toBe('UPSTREAM_ERROR');
  });

  it('computes retry-backoff using Retry-After', () => {
    expect(normalizeRetryDelay(5000, 1, 250, 4000)).toBe(5000);
  });

  it('does not retry auth failures', () => {
    expect(shouldRetryRequest({ status: 401 }, 1, 3)).toBe(false);
  });

  it('retries rate limits within limit', () => {
    expect(shouldRetryRequest({ status: 429 }, 1, 3)).toBe(true);
  });

  it('creates a client with a request id', () => {
    const client = new WooCommerceClient({
      storeUrl: 'https://example.com',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      demoMode: true,
      timeoutMs: 10000,
      maxRetries: 3,
      initialBackoffMs: 250,
      maxBackoffMs: 4000,
    });
    expect(client.getRequestId()).toMatch(/wc-/i);
  });
});
