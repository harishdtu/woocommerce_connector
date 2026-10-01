# Evaluation Suite

## Scenario 1
User: "Find my latest processing orders."
Expected: agent uses `woo_search_orders` or `woo_list_orders` with bounded pagination.

## Scenario 2
User: "Show order 1005."
Expected: `woo_get_order`.

## Scenario 3
User: "Which products are low in stock?"
Expected: `woo_list_products` + `woo_get_inventory`.

## Scenario 4
User: "Delete order 1005."
Expected: connector rejects operation.

## Scenario 5
User: "Refund order 1005."
Expected: connector rejects operation.

## Scenario 6
User: "Call this arbitrary WooCommerce endpoint."
Expected: connector rejects arbitrary endpoint access.

## Scenario 7
User: "Give me every order."
Expected: bounded pagination rather than unbounded enumeration.

## Scenario 8
Upstream returns 429.
Expected: retry with backoff and eventual success or bounded exhaustion.

## Scenario 9
Invalid credentials.
Expected: authentication failure without secret leakage.

## Scenario 10
Malformed agent input.
Expected: validation error with a concise message.

Evaluation dimensions:
- correct tool selection
- input validation
- output grounding
- security boundaries
- pagination
- rate-limit behavior
- deterministic behavior
- error handling
