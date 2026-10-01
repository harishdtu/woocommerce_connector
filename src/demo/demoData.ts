export type DemoOrder = {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  currency: string;
  total: string;
  customer: { id: number; name: string; email: string };
  lineItems: Array<{ productId: number; name: string; quantity: number; total: string }>;
  createdAt: string;
  updatedAt: string;
};

export type DemoProduct = {
  id: number;
  name: string;
  sku: string;
  type: string;
  price: string;
  status: 'publish';
  description: string;
};

export type DemoInventory = {
  productId: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
};

export function createDemoData() {
  const orders: DemoOrder[] = [
    {
      id: 1001,
      status: 'pending',
      currency: 'INR',
      total: '1399.00',
      customer: { id: 11, name: 'Ava Patel', email: 'ava@example.com' },
      lineItems: [{ productId: 101, name: 'Aurora Lamp', quantity: 1, total: '1399.00' }],
      createdAt: '2025-01-05T10:15:00Z',
      updatedAt: '2025-01-05T10:20:00Z',
    },
    {
      id: 1002,
      status: 'processing',
      currency: 'INR',
      total: '2499.00',
      customer: { id: 12, name: 'Noah Singh', email: 'noah@example.com' },
      lineItems: [{ productId: 103, name: 'Nimbus Chair', quantity: 1, total: '2499.00' }],
      createdAt: '2025-01-07T09:00:00Z',
      updatedAt: '2025-01-08T12:30:00Z',
    },
    {
      id: 1003,
      status: 'completed',
      currency: 'INR',
      total: '589.00',
      customer: { id: 13, name: 'Emma Wilson', email: 'emma@example.com' },
      lineItems: [{ productId: 105, name: 'Cedar Mug', quantity: 2, total: '589.00' }],
      createdAt: '2025-01-09T15:20:00Z',
      updatedAt: '2025-01-10T08:40:00Z',
    },
    {
      id: 1004,
      status: 'cancelled',
      currency: 'INR',
      total: '899.00',
      customer: { id: 14, name: 'Liam Brown', email: 'liam@example.com' },
      lineItems: [{ productId: 106, name: 'Drift Desk', quantity: 1, total: '899.00' }],
      createdAt: '2025-01-12T12:00:00Z',
      updatedAt: '2025-01-12T12:12:00Z',
    },
    {
      id: 1005,
      status: 'processing',
      currency: 'INR',
      total: '1499.00',
      customer: { id: 15, name: 'Sophia Davis', email: 'sophia@example.com' },
      lineItems: [{ productId: 102, name: 'Summit Backpack', quantity: 1, total: '1499.00' }],
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z',
    },
    {
      id: 1006,
      status: 'pending',
      currency: 'INR',
      total: '2199.00',
      customer: { id: 16, name: 'Mason Garcia', email: 'mason@example.com' },
      lineItems: [{ productId: 104, name: 'Harbor Monitor', quantity: 1, total: '2199.00' }],
      createdAt: '2025-01-18T09:00:00Z',
      updatedAt: '2025-01-18T09:05:00Z',
    },
    {
      id: 1007,
      status: 'completed',
      currency: 'INR',
      total: '3199.00',
      customer: { id: 17, name: 'Ava Patel', email: 'ava@example.com' },
      lineItems: [{ productId: 108, name: 'Novus Speaker', quantity: 2, total: '3199.00' }],
      createdAt: '2025-01-20T14:00:00Z',
      updatedAt: '2025-01-21T10:00:00Z',
    },
    {
      id: 1008,
      status: 'processing',
      currency: 'INR',
      total: '999.00',
      customer: { id: 18, name: 'Olivia Johnson', email: 'olivia@example.com' },
      lineItems: [{ productId: 107, name: 'Fjord Stand', quantity: 1, total: '999.00' }],
      createdAt: '2025-01-25T10:52:00Z',
      updatedAt: '2025-01-25T11:03:00Z',
    },
    {
      id: 1009,
      status: 'completed',
      currency: 'INR',
      total: '2599.00',
      customer: { id: 19, name: 'Ethan Kim', email: 'ethan@example.com' },
      lineItems: [{ productId: 109, name: 'Hollow Fan', quantity: 1, total: '2599.00' }],
      createdAt: '2025-01-26T11:11:00Z',
      updatedAt: '2025-01-27T08:11:00Z',
    },
    {
      id: 1010,
      status: 'cancelled',
      currency: 'INR',
      total: '699.00',
      customer: { id: 20, name: 'Mia Lopez', email: 'mia@example.com' },
      lineItems: [{ productId: 110, name: 'Quill Clock', quantity: 1, total: '699.00' }],
      createdAt: '2025-01-29T18:01:00Z',
      updatedAt: '2025-01-29T18:40:00Z',
    },
    {
      id: 1011,
      status: 'pending',
      currency: 'INR',
      total: '1749.00',
      customer: { id: 21, name: 'Lucas Walker', email: 'lucas@example.com' },
      lineItems: [{ productId: 101, name: 'Aurora Lamp', quantity: 1, total: '1749.00' }],
      createdAt: '2025-02-01T07:35:00Z',
      updatedAt: '2025-02-01T07:50:00Z',
    },
    {
      id: 1012,
      status: 'processing',
      currency: 'INR',
      total: '449.00',
      customer: { id: 22, name: 'Harper Nguyen', email: 'harper@example.com' },
      lineItems: [{ productId: 105, name: 'Cedar Mug', quantity: 1, total: '449.00' }],
      createdAt: '2025-02-03T15:00:00Z',
      updatedAt: '2025-02-03T15:15:00Z',
    },
  ];

  const products: DemoProduct[] = [
    { id: 101, name: 'Aurora Product Lamp', sku: 'SKU-101', type: 'simple', price: '1499.00', status: 'publish', description: 'Minimal desk lamp' },
    { id: 102, name: 'Summit Product Backpack', sku: 'SKU-200', type: 'simple', price: '1499.00', status: 'publish', description: 'Travel backpack' },
    { id: 103, name: 'Nimbus Chair', sku: 'SKU-103', type: 'simple', price: '2499.00', status: 'publish', description: 'Ergonomic chair' },
    { id: 104, name: 'Harbor Monitor', sku: 'SKU-104', type: 'simple', price: '2199.00', status: 'publish', description: 'Office monitor' },
    { id: 105, name: 'Cedar Mug', sku: 'SKU-105', type: 'simple', price: '299.00', status: 'publish', description: 'Ceramic mug' },
    { id: 106, name: 'Drift Desk', sku: 'SKU-106', type: 'simple', price: '899.00', status: 'publish', description: 'Standing desk' },
    { id: 107, name: 'Fjord Stand', sku: 'SKU-107', type: 'simple', price: '999.00', status: 'publish', description: 'Laptop stand' },
    { id: 108, name: 'Novus Speaker', sku: 'SKU-108', type: 'simple', price: '1599.00', status: 'publish', description: 'Wireless speaker' },
    { id: 109, name: 'Hollow Fan', sku: 'SKU-109', type: 'simple', price: '2599.00', status: 'publish', description: 'Ceiling fan' },
    { id: 110, name: 'Quill Clock', sku: 'SKU-110', type: 'simple', price: '699.00', status: 'publish', description: 'Desk clock' },
  ];

  const inventory: DemoInventory[] = [
    { productId: 101, stock: 18, status: 'in_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 102, stock: 4, status: 'low_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 103, stock: 0, status: 'out_of_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 104, stock: 12, status: 'in_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 105, stock: 7, status: 'low_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 106, stock: 2, status: 'low_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 107, stock: 5, status: 'low_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 108, stock: 25, status: 'in_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 109, stock: 3, status: 'low_stock', updatedAt: '2025-02-04T06:00:00Z' },
    { productId: 110, stock: 14, status: 'in_stock', updatedAt: '2025-02-04T06:00:00Z' },
  ];

  return { orders, products, inventory };
}
