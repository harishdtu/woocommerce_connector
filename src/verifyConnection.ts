import { resolveRuntimeConfig } from './config/config.js';
import { WooCommerceClient } from './client/woocommerceClient.js';

async function main(): Promise<void> {
  const config = resolveRuntimeConfig(process.env);
  if (config.demoMode) {
    console.log('Demo mode is enabled; no external WooCommerce credentials are required.');
    return;
  }

  const client = new WooCommerceClient({
    demoMode: false,
    storeUrl: config.storeUrl ?? 'https://example.com',
    consumerKey: config.consumerKey ?? '',
    consumerSecret: config.consumerSecret ?? '',
    maxRetries: config.maxRetries,
    initialBackoffMs: config.initialBackoffMs,
    maxBackoffMs: config.maxBackoffMs,
    requestTimeoutMs: config.requestTimeoutMs,
    maxAutoPages: config.maxAutoPages,
  });

  try {
    const data = await client.get<{ length: number }>('orders', { per_page: 1 });
    console.log(`Connection verified against ${config.storeUrl}. Returned ${Array.isArray(data) ? data.length : 0} records.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    console.error(`Connection verification failed: ${message}`);
    process.exitCode = 1;
  }
}

main();
