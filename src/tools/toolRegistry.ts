import { z } from 'zod';
import { createDemoData } from '../demo/demoData.js';
import { InventoryService } from '../services/inventoryService.js';
import { OrderService } from '../services/orderService.js';
import { ProductService } from '../services/productService.js';

const demoData = createDemoData();
const orderService = new OrderService(demoData);
const productService = new ProductService(demoData);
const inventoryService = new InventoryService(demoData);

export const ALLOWED_TOOLS = [
  'woo_list_orders',
  'woo_get_order',
  'woo_search_orders',
  'woo_list_products',
  'woo_get_product',
  'woo_search_products',
  'woo_get_inventory',
] as const;

export type AllowedToolName = (typeof ALLOWED_TOOLS)[number];

export type ToolExecutionResult =
  | { ok: true; data: any; error?: never }
  | { ok: false; data?: any; error: { code: string; message: string } };

export const orderIdSchema = z.number().int().positive();
export const productIdSchema = z.number().int().positive();
export const pageSchema = z.number().int().min(1);
export const perPageSchema = z.number().int().min(1).max(100);
export const searchSchema = z.string().max(100).trim();

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  authorizationBoundary: string;
  execute: (input: any) => any;
};

const connectorTools: ToolDefinition[] = [
  {
    name: 'woo_list_orders',
    description: 'List WooCommerce orders with bounded pagination. Use this to inspect recent merchant orders without enumerating all records.',
    inputSchema: z.object({
      page: pageSchema.default(1),
      per_page: perPageSchema.default(20),
      status: z.string().optional(),
      search: searchSchema.optional(),
    }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; order listing only',
    execute: (input: { page: number; per_page: number; status?: string; search?: string }) => {
      return orderService.listOrders({ page: input.page, perPage: input.per_page, status: input.status, search: input.search });
    },
  },
  {
    name: 'woo_get_order',
    description: 'Retrieve a single WooCommerce order by numeric order ID. Use this when the order ID is already known. Do not use this tool to enumerate orders.',
    inputSchema: z.object({ id: orderIdSchema }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; single order lookup only',
    execute: (input: { id: number }) => {
      return { order: orderService.getOrder(input.id) };
    },
  },
  {
    name: 'woo_search_orders',
    description: 'Search WooCommerce orders by customer name, status, or product name with bounded pagination.',
    inputSchema: z.object({
      search: searchSchema,
      page: pageSchema.default(1),
      per_page: perPageSchema.default(20),
    }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; search only',
    execute: (input: { search: string; page: number; per_page: number }) => {
      return orderService.searchOrders({ search: input.search, page: input.page, perPage: input.per_page });
    },
  },
  {
    name: 'woo_list_products',
    description: 'List WooCommerce products with bounded pagination. Use this to review catalog inventory and pricing.',
    inputSchema: z.object({
      page: pageSchema.default(1),
      per_page: perPageSchema.default(20),
      search: searchSchema.optional(),
    }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; catalog listing only',
    execute: (input: { page: number; per_page: number; search?: string }) => {
      return productService.listProducts({ page: input.page, perPage: input.per_page, search: input.search });
    },
  },
  {
    name: 'woo_get_product',
    description: 'Retrieve a single WooCommerce product by numeric product ID. Use this when the product ID is already known.',
    inputSchema: z.object({ id: productIdSchema }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; single product lookup only',
    execute: (input: { id: number }) => {
      return { product: productService.getProduct(input.id) };
    },
  },
  {
    name: 'woo_search_products',
    description: 'Search WooCommerce products by SKU, product name, or description within a bounded result set.',
    inputSchema: z.object({
      search: searchSchema,
      page: pageSchema.default(1),
      per_page: perPageSchema.default(20),
    }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; product search only',
    execute: (input: { search: string; page: number; per_page: number }) => {
      return productService.searchProducts({ search: input.search, page: input.page, perPage: input.per_page });
    },
  },
  {
    name: 'woo_get_inventory',
    description: 'Inspect inventory for a single product. Returns normalized stock status such as in_stock, low_stock, or out_of_stock.',
    inputSchema: z.object({ product_id: productIdSchema }),
    outputSchema: z.any(),
    authorizationBoundary: 'read-only; single inventory status only',
    execute: (input: { product_id: number }) => {
      return inventoryService.getInventory(input.product_id);
    },
  },
] as const;

export const toolDefinitions = connectorTools;

export function isAllowedToolName(value: string): boolean {
  return ALLOWED_TOOLS.includes(value as AllowedToolName);
}

export async function executeTool(name: string, input: unknown): Promise<ToolExecutionResult> {
  if (!isAllowedToolName(name)) {
    return {
      ok: false,
      error: { code: 'UNSUPPORTED_OPERATION', message: 'The requested tool is not in the read-only allowlist.' },
    };
  }

  const tool = toolDefinitions.find((entry) => entry.name === name);
  if (!tool) {
    return {
      ok: false,
      error: { code: 'UNSUPPORTED_OPERATION', message: 'No matching connector tool was found.' },
    };
  }

  const parsed = tool.inputSchema.safeParse(input);
  if (!parsed.success) {
    const reason = parsed.error.issues.map((issue) => issue.message).join('; ');
    return {
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: `Invalid input for ${name}: ${reason}` },
    };
  }

  try {
    const data = tool.execute(parsed.data);
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed';
    return { ok: false, error: { code: 'NOT_FOUND', message } };
  }
}
