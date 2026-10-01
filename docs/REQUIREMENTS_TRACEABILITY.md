# Requirements Traceability

This document maps the assignment requirements to the actual implementation in this repository. Only requirements verified from code, tests, or runnable scripts are marked PASS.

## Requirements

| Requirement | Implementation File(s) | Test(s) | Status | Notes |
| --- | --- | --- | --- | --- |
| 1. API-key authentication | `src/config/config.ts`, `src/client/woocommerceClient.ts` | `tests/auth/config.test.ts`, `tests/client/retry.test.ts` | PASS | Live mode requires `WOOCOMMERCE_STORE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, and `WOOCOMMERCE_CONSUMER_SECRET`. The client builds a Basic Authorization header using the consumer key/secret pair. |
| 2. list primitives | `src/services/orderService.ts`, `src/services/productService.ts`, `src/tools/toolRegistry.ts` | `tests/services/commerce.test.ts`, `tests/tools/tool-contracts.test.ts` | PASS | `woo_list_orders` and `woo_list_products` are implemented and bounded by pagination. |
| 3. get primitives | `src/services/orderService.ts`, `src/services/productService.ts`, `src/services/inventoryService.ts`, `src/tools/toolRegistry.ts` | `tests/services/commerce.test.ts`, `tests/tools/tool-contracts.test.ts` | PASS | `woo_get_order`, `woo_get_product`, and `woo_get_inventory` are implemented and return normalized output. |
| 4. search primitives | `src/services/orderService.ts`, `src/services/productService.ts`, `src/tools/toolRegistry.ts` | `tests/services/commerce.test.ts`, `tests/tools/tool-contracts.test.ts` | PASS | Search is bounded and only searches by merchant-safe fields such as customer name, product name, SKU, and status. |
| 5. rate-limit handling | `src/client/woocommerceClient.ts`, `src/client/errorClassifier.ts` | `tests/client/retry.test.ts` | PASS | The client detects HTTP 429, honors `Retry-After` when present, performs exponential backoff with an upper bound, and classifies retryable vs non-retryable failures. |
| 6. MCP tool specification OR equivalent | `src/tools/toolRegistry.ts` | `tests/tools/tool-contracts.test.ts` | PASS | This repository exposes a documented, explicit equivalent agent tool interface instead of claiming fake MCP. Each tool has a name, description, input schema, output schema, and a safe execution boundary. |
| 7. working demonstration | `src/demo.ts`, `src/demo/demoData.ts`, `src/tools/toolRegistry.ts` | `npm run demo` | PASS | The demo runs without credentials and exercises startup, tool registration, product and order searches, inventory, pagination, and retry simulation. |
| 8. setup instructions | `README.md`, `.env.example` | Manual verification of command flow | PASS | `npm install` and environment setup are documented with placeholder values. |
| 9. run instructions | `README.md`, `package.json` | Manual verification of `npm run demo`, `npm test`, `npm run build`, `npm run lint` | PASS | The commands are present and runnable from the repository root. |
| 10. assumptions | `README.md`, `LIMITATIONS.md`, `MERCHANT_WORKFLOWS.md` | Manual review of docs | PASS | The connector is intentionally scoped to read-only merchant workflows and does not claim full WooCommerce administrative access. |
| 11. limitations | `LIMITATIONS.md`, `SECURITY.md` | Manual review of docs | PASS | The project clearly documents narrow scope, no mutation, and the boundary between demo mode and live use. |
| 12. no real customer data | `src/demo/demoData.ts` | `tests/services/commerce.test.ts` | PASS | Demo data uses fictional names and email addresses only; the service layer strips unnecessary PII before exposure. |
| 13. no credentials committed | `.gitignore`, `.env.example`, `src/config/config.ts` | Repository inspection and config validation | PASS | `.env` is ignored and placeholder credentials appear only in `.env.example`. |
| 14. safe agent access | `src/tools/toolRegistry.ts`, `src/security/review.ts`, `src/client/woocommerceClient.ts` | `tests/security/readOnly.test.ts`, `tests/tools/tool-contracts.test.ts` | PASS | Tool access is allowlisted; arbitrary endpoints, arbitrary HTTP methods, and mutation-style operations are blocked by code. |

## Implementation Notes

- The connector is intentionally read-only and bounded to Shopify-style merchant queries; it does not expose arbitrary WooCommerce endpoints.
- The project relies on environment-based configuration and demo-mode safety for local execution.
- The actual live-mode contract is a Basic Auth API-key pair, not a hidden or embedded credential path.
- The repo exposes a safe equivalent to MCP tool semantics rather than claiming a fake or incomplete MCP implementation.

## Verification Commands

The repository was verified by running:

```bash
npm test
npm run build
npm run lint
npm run demo
```

The project is considered submission-ready only when these commands succeed in the repository as checked out.
