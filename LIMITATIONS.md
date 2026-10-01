# Limitations

- WooCommerce version differences can change field names and endpoint behavior.
- Plugin variability can affect the available data and response structure.
- Custom fields are intentionally minimized and not surfaced broadly.
- API key management is delegated to the host environment.
- Hosting-specific rate limits can differ by region and platform.
- Pagination is intentionally bounded to prevent unbounded retrieval.
- The connector is read-only and cannot create, update, refund, or delete records.
- Payment and refund capability are intentionally absent.
- Customer data is minimized by design.
- Multi-store deployments require per-store configuration and policy separation.
- Secret handling should follow a production-grade vault or secret manager.
- Observability should be expanded with metrics and audit trails before large-scale rollout.

A production architecture would include:

Agent
↓
Policy / permission layer
↓
Connector service
↓
Credential vault
↓
WooCommerce
↓
Audit / event pipeline
↓
Monitoring and alerting
