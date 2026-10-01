# Architecture Decision Record

## Why TypeScript?
Decision: TypeScript is used for the connector implementation.
Reason: strong typing improves safety for tool contracts and API boundaries.
Alternative: JavaScript or Python.
Tradeoff: a small setup cost, but much stronger validation for an AI-facing tool surface.

## Why API client abstraction?
Decision: All WooCommerce interactions pass through a dedicated client layer.
Reason: it centralizes authentication, retries, timeout, and error normalization.
Alternative: duplicate fetch logic across each service.
Tradeoff: one extra abstraction layer, but much better reusability and maintainability.

## Why normalized schemas?
Decision: Domain services return normalized data rather than raw WooCommerce payloads.
Reason: normalized outputs are safer for AI agents and more stable across WooCommerce versions.
Alternative: exposing raw API objects directly.
Tradeoff: a small mapping cost, but better security and predictability.

## Why read-only?
Decision: The connector is intentionally limited to read operations.
Reason: merchant agents need operational visibility without mutation risk.
Alternative: broader write access.
Tradeoff: less functionality, but far stronger safety and easier compliance review.

## Why allowlisted tools?
Decision: Tool names are enforced in code and blocked if not explicitly allowed.
Reason: this avoids generic endpoint execution and mutation paths.
Alternative: prompt-only restrictions.
Tradeoff: less flexibility, but explicit control and auditability.

## Why mock mode?
Decision: Demo mode uses deterministic fictional data with the same service interfaces as production.
Reason: the repository stays runnable without real credentials and without network dependence.
Alternative: a separate fake backend.
Tradeoff: a little more development work, but a more realistic and testable architecture.

## Why bounded pagination?
Decision: Every list operation uses page and per_page limits.
Reason: AI agents must not accidentally enumerate the full merchant catalog or order history.
Alternative: unlimited fetches.
Tradeoff: constrained result size, but safer and more predictable runtime behavior.

## Why retries?
Decision: Retry behavior is bounded and categorized by error type.
Reason: transient upstream failures should be resilient without turning network errors into a loop.
Alternative: no retries or unlimited retries.
Tradeoff: slightly more complexity, but much better production reliability.

## Why deterministic tests?
Decision: Tests use explicit fixtures and mock behavior rather than internet access.
Reason: deterministic tests are repeatable and suitable for CI.
Alternative: live integration tests.
Tradeoff: less realism in a single scenario, but much better stability and review confidence.

## Why structured errors?
Decision: Errors are normalized into categories and concise messages.
Reason: this makes agent tooling understandable and keeps stack traces out of user-facing interfaces.
Alternative: raw exceptions.
Tradeoff: a little less detail for debugging, but far better operational clarity.
