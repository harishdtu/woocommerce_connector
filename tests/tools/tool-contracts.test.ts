import { describe, expect, it } from 'vitest';
import { ALLOWED_TOOLS, executeTool, toolDefinitions } from '../../src/tools/toolRegistry.js';

describe('tool contract registry', () => {
  it('registers the required tool names', () => {
    expect(ALLOWED_TOOLS).toContain('woo_list_orders');
    expect(ALLOWED_TOOLS).toContain('woo_get_order');
    expect(ALLOWED_TOOLS).toContain('woo_search_orders');
    expect(ALLOWED_TOOLS).toContain('woo_list_products');
    expect(ALLOWED_TOOLS).toContain('woo_get_product');
    expect(ALLOWED_TOOLS).toContain('woo_search_products');
    expect(ALLOWED_TOOLS).toContain('woo_get_inventory');
  });

  it('defines seven tool contracts', () => {
    expect(toolDefinitions).toHaveLength(7);
  });

  it('requires validation schema for tool inputs', () => {
    const tool = toolDefinitions.find((entry) => entry.name === 'woo_get_order');
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it('executes tool for known order lookup', async () => {
    const result = await executeTool('woo_get_order', { id: 1005 });
    expect(result.ok).toBe(true);
    expect(result.data.order.id).toBe(1005);
  });

  it('rejects unsupported tools', async () => {
    const result = await executeTool('woo_create_order' as never, { foo: 'bar' } as never);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid pagination', async () => {
    const result = await executeTool('woo_list_orders', { page: 0, per_page: 10 });
    expect(result.ok).toBe(false);
  });

  it('returns inventory with normalized status', async () => {
    const result = await executeTool('woo_get_inventory', { product_id: 101 });
    expect(result.ok).toBe(true);
    expect(result.data.status).toMatch(/in_stock|low_stock|out_of_stock/);
  });
});
