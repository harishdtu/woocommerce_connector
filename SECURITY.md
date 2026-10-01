# Security Review

## Authentication

The connector supports WooCommerce API-key authentication using the documented `consumer_key` and `consumer_secret` pair. In live mode, credentials come only from environment variables and are never hardcoded.

## Authorization

The connector is intentionally allowlisted to a fixed set of read-only tools. Any unsupported action is rejected before execution.

## Least Privilege

Only the needed merchant primitives are exposed: orders, products, and inventory. No mutation, refund, or payment tools are included.

## Secret Management

- Secrets are loaded from environment variables only.
- `.env` is gitignored.
- Logs do not print credentials or authorization headers.
- No secrets are committed to the repository.

## Data Minimization

Normalized output avoids payment metadata, billing details, shipping addresses, arbitrary custom fields, and internal WordPress details. Only the minimal data relevant to merchant workflows is returned.

## PII Handling

Customer names are included only in a minimal, agent-friendly form. The connector does not expose unnecessary customer details or sensitive order internals.

## Logging Restrictions

Structured logs include request IDs, tool names, status codes, retry counts, and categories. They do not include secrets or full customer payloads.

## Arbitrary Endpoint Prevention

The HTTP client enforces a narrow allowlist of configured WooCommerce endpoints. Arbitrary route execution is rejected.

## Validation

Every tool input is validated through Zod schemas. Pagination, IDs, and search strings are bounded to safe ranges.

## Rate Limits

The client respects `429` responses, supports `Retry-After`, and uses bounded retries with exponential backoff and jitter.

## Production Recommendations

- Store secrets in a managed secret vault.
- Add audit logging for tool-level access.
- Restrict deployment to a dedicated merchant connector service.
- Review API rate limits and region-specific behavior before scaling beyond a single store.
