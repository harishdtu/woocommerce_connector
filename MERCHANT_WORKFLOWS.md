# Merchant Workflows

## 1. Order lookup
Merchant problem: a support agent needs to review the status of a specific order.
Agent interaction: ask for order ID and call `woo_get_order`.
Tools used: `woo_get_order`
Data required: order ID
Safety boundary: read-only lookup only
Expected outcome: normalized order details for support review

## 2. Order status investigation
Merchant problem: a merchant wants to see which orders are still processing.
Agent interaction: use `woo_list_orders` with a status filter.
Tools used: `woo_list_orders`
Data required: status and pagination settings
Safety boundary: read-only; no mutation
Expected outcome: recent processing orders with minimal fields

## 3. Inventory monitoring
Merchant problem: the team wants to monitor whether products are out of stock.
Agent interaction: check product inventory via `woo_get_inventory`.
Tools used: `woo_get_inventory`
Data required: product ID
Safety boundary: read-only
Expected outcome: stock status and updated timestamp

## 4. Low-stock identification
Merchant problem: identify products that need replenishment.
Agent interaction: list products, inspect inventory, compare stock status.
Tools used: `woo_list_products`, `woo_get_inventory`
Data required: price list and stock details
Safety boundary: read-only
Expected outcome: actionable list of low-stock items

## 5. Product lookup
Merchant problem: a support rep needs product details for customer questions.
Agent interaction: call `woo_get_product` or `woo_search_products`.
Tools used: `woo_get_product`, `woo_search_products`
Data required: item name, SKU, or product ID
Safety boundary: read-only catalog access
Expected outcome: normalized product details

## 6. Customer support context
Merchant problem: an agent needs the order context before replying to a customer.
Agent interaction: fetch order and product data with minimal fields.
Tools used: `woo_get_order`, `woo_get_product`
Data required: order ID, product ID
Safety boundary: read-only and normalized data output
Expected outcome: contextual support history without sensitive payload exposure

## 7. Operations reporting
Merchant problem: operations wants a recent high-level report of order and catalog activity.
Agent interaction: list orders and products with bounded pages.
Tools used: `woo_list_orders`, `woo_list_products`
Data required: pagination and filters
Safety boundary: read-only and bounded output
Expected outcome: concise operational snapshot for review
