import { z } from 'zod';

export const runtimeConfigSchema = z.object({
  DEMO_MODE: z.string().optional(),
  WOOCOMMERCE_STORE_URL: z.string().optional(),
  WOOCOMMERCE_CONSUMER_KEY: z.string().optional(),
  WOOCOMMERCE_CONSUMER_SECRET: z.string().optional(),
  MAX_RETRIES: z.string().optional(),
  INITIAL_BACKOFF_MS: z.string().optional(),
  MAX_BACKOFF_MS: z.string().optional(),
  REQUEST_TIMEOUT_MS: z.string().optional(),
  MAX_AUTO_PAGES: z.string().optional(),
});

export type RuntimeConfigInput = z.input<typeof runtimeConfigSchema>;

export type RuntimeConfig = {
  demoMode: boolean;
  storeUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  requestTimeoutMs: number;
  maxAutoPages: number;
};

const isValidStoreUrl = (value?: string): boolean => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export function normalizeConfig(input: RuntimeConfigInput = process.env): RuntimeConfig {
  const parsed = runtimeConfigSchema.parse(input);
  const demoMode = String(parsed.DEMO_MODE ?? 'true').toLowerCase() === 'true';

  if (demoMode) {
    return {
      demoMode: true,
      storeUrl: parsed.WOOCOMMERCE_STORE_URL,
      consumerKey: parsed.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: parsed.WOOCOMMERCE_CONSUMER_SECRET,
      maxRetries: Number.parseInt(parsed.MAX_RETRIES ?? '3', 10),
      initialBackoffMs: Number.parseInt(parsed.INITIAL_BACKOFF_MS ?? '250', 10),
      maxBackoffMs: Number.parseInt(parsed.MAX_BACKOFF_MS ?? '4000', 10),
      requestTimeoutMs: Number.parseInt(parsed.REQUEST_TIMEOUT_MS ?? '10000', 10),
      maxAutoPages: Number.parseInt(parsed.MAX_AUTO_PAGES ?? '5', 10),
    };
  }

  if (!parsed.WOOCOMMERCE_STORE_URL || !isValidStoreUrl(parsed.WOOCOMMERCE_STORE_URL)) {
    throw new Error('WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET are required in live mode.');
  }

  if (!parsed.WOOCOMMERCE_CONSUMER_KEY || !parsed.WOOCOMMERCE_CONSUMER_SECRET) {
    throw new Error('WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET are required in live mode.');
  }

  return {
    demoMode: false,
    storeUrl: parsed.WOOCOMMERCE_STORE_URL,
    consumerKey: parsed.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: parsed.WOOCOMMERCE_CONSUMER_SECRET,
    maxRetries: Number.parseInt(parsed.MAX_RETRIES ?? '3', 10),
    initialBackoffMs: Number.parseInt(parsed.INITIAL_BACKOFF_MS ?? '250', 10),
    maxBackoffMs: Number.parseInt(parsed.MAX_BACKOFF_MS ?? '4000', 10),
    requestTimeoutMs: Number.parseInt(parsed.REQUEST_TIMEOUT_MS ?? '10000', 10),
    maxAutoPages: Number.parseInt(parsed.MAX_AUTO_PAGES ?? '5', 10),
  };
}

export function resolveRuntimeConfig(input: RuntimeConfigInput = process.env): RuntimeConfig {
  return normalizeConfig(input);
}
