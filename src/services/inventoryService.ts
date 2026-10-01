import { createDemoData } from '../demo/demoData.js';

export class InventoryService {
  constructor(private readonly data = createDemoData()) {}

  getInventory(productId: number): Record<string, any> {
    const product = this.data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found.`);
    }

    const inventory = this.data.inventory.find((item) => item.productId === productId);
    if (!inventory) {
      throw new Error(`Inventory for product ${productId} not found.`);
    }

    return {
      product_id: product.id,
      status: inventory.status,
      stock: inventory.stock,
      updated_at: inventory.updatedAt,
    };
  }
}
