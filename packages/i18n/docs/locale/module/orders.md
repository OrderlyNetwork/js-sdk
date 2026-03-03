# orders

## Overview

Order history and actions: status (pending, filled, partial filled, canceled, rejected, incomplete, completed), toast titles (opened, filled, canceled, rejected, replaced, scaled sub-order, trailing activated), columns (fill/quantity, order time, hidden), edit order confirm texts, cancel order/cancel all (pending, TP/SL, for symbol), validation messages (price, quantity), renew, download tooltip.

## Exports

### `orders`

Object of keys under `orders.*` and `order.edit.confirm.*`: e.g. `orders.status.filled`, `orders.cancelAll.description`, `order.edit.confirm.quantity`.

### `Orders` (type)

`typeof orders`.
