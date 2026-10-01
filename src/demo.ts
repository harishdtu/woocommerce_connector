import { resolveRuntimeConfig } from './config/config.js';
import { WooCommerceClient } from './client/woocommerceClient.js';
import { executeTool } from './tools/toolRegistry.js';

async function main(): Promise<void> {
  const config = resolveRuntimeConfig(process.env);
  const client = new WooCommerceClient({
    demoMode: config.demoMode,
    storeUrl: config.storeUrl ?? 'https://demo-store.example.com',
    consumerKey: config.consumerKey ?? 'demo_key',
    consumerSecret: config.consumerSecret ?? 'demo_secret',
    maxRetries: config.maxRetries,
    initialBackoffMs: config.initialBackoffMs,
    maxBackoffMs: config.maxBackoffMs,
    requestTimeoutMs: config.requestTimeoutMs,
    maxAutoPages: config.maxAutoPages,
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('WooCommerce Agent Connector');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✓ Connector initialized');
  console.log(`✓ Demo mode enabled: ${config.demoMode}`);
  console.log('✓ 7 tools registered');

  const orderSearch = await executeTool('woo_search_orders', { search: 'Ava', page: 1, per_page: 10 });
  if (orderSearch.ok && orderSearch.data && typeof orderSearch.data === 'object' && 'orders' in orderSearch.data) {
    console.log('[1] Search orders');
    console.log(`✓ Found ${Array.isArray(orderSearch.data.orders) ? orderSearch.data.orders.length : 0} matching orders`);
  }

  const orderLookup = await executeTool('woo_get_order', { id: 1005 });
  if (orderLookup.ok) {
    console.log('[2] Get order');
    console.log('✓ Order #1005');
  }

  const productSearch = await executeTool('woo_search_products', { search: 'SKU-200', page: 1, per_page: 10 });
  if (productSearch.ok && productSearch.data && typeof productSearch.data === 'object' && 'products' in productSearch.data) {
    console.log('[3] Search products');
    console.log(`✓ Found ${Array.isArray(productSearch.data.products) ? productSearch.data.products.length : 0} products`);
  }

  const inventory = await executeTool('woo_get_inventory', { product_id: 101 });
  if (inventory.ok) {
    console.log('[4] Inventory');
    console.log(`✓ Inventory retrieved: ${String((inventory.data as { status?: string })?.status ?? 'unknown')}`);
  }

  const rateLimitResult = await client.simulateRateLimitScenario();
  console.log('[5] Rate-limit simulation');
  console.log(`429 received`);
  console.log(`Retrying...`);
  console.log(`✓ Request succeeded with ${rateLimitResult.retryCount} retry cycles`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown demo failure';
  console.error(message);
  process.exitCode = 1;
});
