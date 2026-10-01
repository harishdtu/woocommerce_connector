import { describe, expect, it } from 'vitest';
import { normalizeConfig, resolveRuntimeConfig } from '../../src/config/config.js';

describe('runtime configuration', () => {
  it('accepts demo mode without credentials', () => {
    const cfg = normalizeConfig({ DEMO_MODE: 'true' });
    expect(cfg.demoMode).toBe(true);
    expect(cfg.storeUrl).toBeUndefined();
  });

  it('requires credentials when not in demo mode', () => {
    expect(() => normalizeConfig({ DEMO_MODE: 'false' })).toThrow(/WOOCOMMERCE_CONSUMER_KEY|WOOCOMMERCE_CONSUMER_SECRET/);
  });

  it('accepts valid live configuration', () => {
    const cfg = normalizeConfig({
      DEMO_MODE: 'false',
      WOOCOMMERCE_STORE_URL: 'https://example.com',
      WOOCOMMERCE_CONSUMER_KEY: 'ck_test_123',
      WOOCOMMERCE_CONSUMER_SECRET: 'cs_test_123',
    });
    expect(cfg.storeUrl).toBe('https://example.com');
    expect(cfg.consumerKey).toBe('ck_test_123');
  });

  it('rejects non-http store URLs', () => {
    expect(() => normalizeConfig({ DEMO_MODE: 'false', WOOCOMMERCE_STORE_URL: 'ftp://bad', WOOCOMMERCE_CONSUMER_KEY: 'a', WOOCOMMERCE_CONSUMER_SECRET: 'b' })).toThrow();
  });

  it('converts numeric env values safely', () => {
    const cfg = normalizeConfig({
      DEMO_MODE: 'true',
      MAX_RETRIES: '5',
      INITIAL_BACKOFF_MS: '150',
      MAX_BACKOFF_MS: '7000',
      REQUEST_TIMEOUT_MS: '12000',
    });
    expect(cfg.maxRetries).toBe(5);
    expect(cfg.requestTimeoutMs).toBe(12000);
  });

  it('resolves config from process env', () => {
    const cfg = resolveRuntimeConfig({
      DEMO_MODE: 'true',
      WOOCOMMERCE_STORE_URL: 'https://demo.test',
    });
    expect(cfg.demoMode).toBe(true);
  });
});
