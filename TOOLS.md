# Tool Documentation

## woo_list_orders

Purpose: List recent orders with safe, bounded pagination.

Input:
- page: integer, minimum 1
- per_page: integer, 1 to 100
- status: optional string filter
- search: optional query string

Output:
- orders list
- pagination metadata

Example:
```json
{ "page": 1, "per_page": 20, "status": "processing" }
```

Failure cases:
- invalid page or per_page
- unsupported status values are rejected only if the tool pipeline validates them explicitly

Permissions: read-only

Appropriate use: merchant order review and status triage

Inappropriate use: enumerating all orders beyond the bounded limit

## woo_get_order

Purpose: Retrieve a known order by numeric ID.

Input:
- id: positive integer

Output:
- normalized order details

Example:
```json
{ "id": 1005 }
```

Failure cases:
- order not found
- invalid ID

Permissions: read-only

Appropriate use: investigating a specific order

Inappropriate use: broad order enumeration

## woo_search_orders

Purpose: Search orders by customer name, status, or product match.

Input:
- search: bounded string
- page: positive integer
- per_page: integer 1 to 100

Output:
- matching orders
- pagination metadata

Failure cases:
- empty or oversized search string
- invalid pagination

Permissions: read-only

## woo_list_products

Purpose: List catalog products with safe pagination.

Input:
- page
- per_page
- search (optional)

Output:
- product summaries
- pagination metadata

## woo_get_product

Purpose: Get a single product by ID.

Input:
- id: positive integer

## woo_search_products

Purpose: Search products by SKU, name, or description.

Input:
- search
- page
- per_page

## woo_get_inventory

Purpose: Inspect product stock status.

Input:
- product_id: positive integer

Output:
- product_id
- stock
- status
- updated_at

Permissions: read-only
