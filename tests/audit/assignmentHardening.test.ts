import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeConfig } from '../../src/config/config.js';
import { WooCommerceClient } from '../../src/client/woocommerceClient.js';
import { OrderService } from '../../src/services/orderService.js';
import { createDemoData } from '../../src/demo/demoData.js';
import { ALLOWED_TOOLS, executeTool, toolDefinitions } from '../../src/tools/toolRegistry.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('assignment hardening audit', () => {
  it('makes the equivalent tool interface explicit for every supported tool', () => {
    expect(ALLOWED_TOOLS).toHaveLength(7);
    for (const toolName of ALLOWED_TOOLS) {
      const tool = toolDefinitions.find((entry) => entry.name === toolName);
      expect(tool).toBeDefined();
      expect(tool?.description).toBeTruthy();
      expect(tool?.inputSchema).toBeDefined();
      expect(tool?.outputSchema).toBeDefined();
      expect(tool?.authorizationBoundary).toContain('read-only');
    }
  });

  it('fails clearly when live credentials are missing', () => {
    expect(() =>
      normalizeConfig({
        DEMO_MODE: 'false',
        WOOCOMMERCE_STORE_URL: 'https://example.com',
        WOOCOMMERCE_CONSUMER_KEY: '',
        WOOCOMMERCE_CONSUMER_SECRET: '',
      }),
    ).toThrow(/WOOCOMMERCE_CONSUMER_KEY|WOOCOMMERCE_CONSUMER_SECRET/i);
  });

  it('sends Basic auth headers without leaking secrets in the request path or logs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 1001 }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new WooCommerceClient({
      demoMode: false,
      storeUrl: 'https://example.com',
      consumerKey: 'ck_test_123',
      consumerSecret: 'cs_test_456',
      maxRetries: 1,
      initialBackoffMs: 0,
      maxBackoffMs: 0,
      requestTimeoutMs: 5000,
    });

    const result = await client.get('orders', { per_page: 1 });
    expect(result).toEqual([{ id: 1001 }]);

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const authHeader = (requestInit.headers as Headers).get('Authorization');
    expect(authHeader).toMatch(/^Basic /i);

    const decodedAuth = Buffer.from(authHeader!.replace(/^Basic /i, ''), 'base64').toString('utf8');
    expect(decodedAuth).toBe('ck_test_123:cs_test_456');
    expect(String(requestUrl)).not.toContain('cs_test_456');
  });

  it('retries a 429 and succeeds on a subsequent request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('', {
          status: 429,
          headers: { 'Retry-After': '0' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1001 }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const client = new WooCommerceClient({
      demoMode: false,
      storeUrl: 'https://example.com',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      maxRetries: 3,
      initialBackoffMs: 0,
      maxBackoffMs: 0,
      requestTimeoutMs: 5000,
    });

    const result = await client.get('orders', { per_page: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ id: 1001 }]);
  });

  it('bounds order pagination and reports final-page metadata correctly', () => {
    const service = new OrderService(createDemoData());

    const firstPage = service.listOrders({ page: 1, perPage: 5 });
    expect(firstPage.orders).toHaveLength(5);
    expect(firstPage.pagination.page).toBe(1);
    expect(firstPage.pagination.hasNextPage).toBe(true);

    const finalPage = service.listOrders({ page: 3, perPage: 5 });
    expect(finalPage.pagination.page).toBe(3);
    expect(finalPage.pagination.totalPages).toBe(3);
    expect(finalPage.pagination.hasNextPage).toBe(false);

    expect(() => service.listOrders({ page: 0, perPage: 5 })).toThrow(/page/i);
    expect(() => service.listOrders({ page: 1, perPage: 0 })).toThrow(/perPage/i);
    expect(() => service.listOrders({ page: 1, perPage: 101 })).toThrow(/perPage/i);
  });

  it('keeps normalized order output free of unnecessary PII and payment metadata', () => {
    const service = new OrderService(createDemoData());
    const order = service.getOrder(1001);

    expect(order.customer).toEqual({ id: 11, name: 'Ava Patel' });
    expect(order.customer).not.toHaveProperty('email');
    expect(order).not.toHaveProperty('billing');
    expect(order).not.toHaveProperty('shipping');
    expect(order).not.toHaveProperty('payment');
    expect(order).not.toHaveProperty('meta_data');
  });

  it('rejects unsupported mutation operations safely', async () => {
    const unsupported = [
      'woo_create_order',
      'woo_update_order',
      'woo_delete_order',
      'woo_refund',
      'delete_customer',
      'arbitrary_request',
    ];

    for (const name of unsupported) {
      const result = await executeTool(name as never, {} as never);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('UNSUPPORTED_OPERATION');
      }
    }
  });
});
