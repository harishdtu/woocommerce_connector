import { z } from 'zod';

export const orderLineItemSchema = z.object({
  product_id: z.number(),
  name: z.string(),
  quantity: z.number(),
  total: z.string(),
});

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const orderSummarySchema = z.object({
  id: z.number(),
  status: z.string(),
  currency: z.string(),
  total: z.string(),
  customer: customerSchema,
  line_items: z.array(orderLineItemSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

export const productSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  price: z.string(),
  description: z.string().optional(),
});

export const inventoryStatusSchema = z.object({
  product_id: z.number(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
  stock: z.number(),
  updated_at: z.string(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  per_page: z.number().int().min(1).max(100),
  total: z.number(),
  total_pages: z.number(),
  has_next_page: z.boolean(),
});

export const apiErrorSchema = z.object({
  category: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  statusCode: z.number().optional(),
});
