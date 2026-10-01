import { createDemoData } from '../demo/demoData.js';

export type OrderListInput = {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
};

export class OrderService {
  constructor(private readonly data = createDemoData()) {}

  listOrders(input: OrderListInput = {}): { orders: Array<any>; pagination: Record<string, number | boolean> } {
    const page = input.page ?? 1;
    const perPage = input.perPage ?? 20;
    if (page < 1 || perPage < 1 || perPage > 100) {
      throw new Error('Order pagination is invalid. Use page >= 1 and perPage between 1 and 100.');
    }

    let orders = [...this.data.orders];
    if (input.status) {
      orders = orders.filter((order) => order.status === input.status);
    }
    if (input.search) {
      const query = input.search.toLowerCase();
      orders = orders.filter((order) => {
        return (
          order.customer.name.toLowerCase().includes(query) ||
          order.status.toLowerCase().includes(query) ||
          order.lineItems.some((item) => item.name.toLowerCase().includes(query))
        );
      });
    }

    const total = orders.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageItems = orders.slice(start, end);

    return {
      orders: pageItems.map((order) => ({
        id: order.id,
        status: order.status,
        currency: order.currency,
        total: order.total,
        customer: { id: order.customer.id, name: order.customer.name },
        line_items: order.lineItems.map((item) => ({
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          total: item.total,
        })),
        created_at: order.createdAt,
        updated_at: order.updatedAt,
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

  getOrder(orderId: number): Record<string, any> {
    const order = this.data.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    return {
      id: order.id,
      status: order.status,
      currency: order.currency,
      total: order.total,
      customer: { id: order.customer.id, name: order.customer.name },
      line_items: order.lineItems.map((item) => ({
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        total: item.total,
      })),
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };
  }

  searchOrders(input: OrderListInput): { orders: Array<any>; pagination: Record<string, number | boolean> } {
    return this.listOrders({ ...input, search: input.search ?? '' });
  }
}
