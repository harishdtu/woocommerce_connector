import { createDemoData } from '../demo/demoData.js';

export type ProductListInput = {
  page?: number;
  perPage?: number;
  search?: string;
};

export class ProductService {
  constructor(private readonly data = createDemoData()) {}

  listProducts(input: ProductListInput = {}): { products: Array<any>; pagination: Record<string, number | boolean> } {
    const page = input.page ?? 1;
    const perPage = input.perPage ?? 20;
    if (page < 1 || perPage < 1 || perPage > 100) {
      throw new Error('Product pagination is invalid. Use page >= 1 and perPage between 1 and 100.');
    }

    let products = [...this.data.products];
    if (input.search) {
      const query = input.search.toLowerCase();
      products = products.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      });
    }

    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      products: products.slice(start, end).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        description: product.description,
      })),
      pagination: {
        page,
        perPage,
        per_page: perPage,
        total,
        totalPages,
        total_pages: totalPages,
        hasNextPage: page < totalPages,
        has_next_page: page < totalPages,
      },
    };
  }

  getProduct(productId: number): Record<string, any> {
    const product = this.data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found.`);
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      description: product.description,
    };
  }

  searchProducts(input: ProductListInput): { products: Array<any>; pagination: Record<string, number | boolean> } {
    return this.listProducts({ ...input, search: input.search ?? '' });
  }
}
