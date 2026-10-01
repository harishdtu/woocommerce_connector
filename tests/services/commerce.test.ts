import { describe, expect, it } from 'vitest';
import { OrderService } from '../../src/services/orderService.js';
import { ProductService } from '../../src/services/productService.js';
import { InventoryService } from '../../src/services/inventoryService.js';
import { createDemoData } from '../../src/demo/demoData.js';

describe('merchant domain services', () => {
  const demo = createDemoData();
  const orderService = new OrderService(demo);
  const productService = new ProductService(demo);
  const inventoryService = new InventoryService(demo);

  it('lists orders with pagination metadata', () => {
    const result = orderService.listOrders({ page: 1, perPage: 10 });
    expect(result.orders.length).toBe(10);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  it('gets a known order', () => {
    const order = orderService.getOrder(1005);
    expect(order.id).toBe(1005);
    expect(order.status).toBe('processing');
  });

  it('returns not found for missing order', () => {
    expect(() => orderService.getOrder(99999)).toThrow(/not found/i);
  });

  it('searches orders by customer name', () => {
    const result = orderService.searchOrders({ search: 'Ava', page: 1, perPage: 20 });
    expect(result.orders.some((order) => order.customer.name.includes('Ava'))).toBe(true);
  });

  it('lists products and keeps normalized shape', () => {
    const result = productService.listProducts({ page: 1, perPage: 10 });
    expect(result.products[0]).toHaveProperty('id');
    expect(result.products[0]).toHaveProperty('name');
  });

  it('gets a known product', () => {
    const product = productService.getProduct(101);
    expect(product.id).toBe(101);
    expect(product.name).toMatch(/product/i);
  });

  it('searches products by SKU', () => {
    const result = productService.searchProducts({ search: 'SKU-200', page: 1, perPage: 20 });
    expect(result.products[0].sku).toBe('SKU-200');
  });

  it('returns inventory for in-stock products', () => {
    const item = inventoryService.getInventory(101);
    expect(item.status).toMatch(/in_stock|low_stock|out_of_stock/);
  });

  it('returns low stock for a product with few units', () => {
    const item = inventoryService.getInventory(106);
    expect(item.status).toBe('low_stock');
  });

  it('throws for missing inventory product', () => {
    expect(() => inventoryService.getInventory(99999)).toThrow(/not found/i);
  });
});
