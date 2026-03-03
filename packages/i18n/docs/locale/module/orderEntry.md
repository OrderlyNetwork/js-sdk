# orderEntry

## Overview

Order entry form: buy/sell labels, order types (Limit, Market, Stop limit/market, Post only, IOC, FOK, Scaled, Trailing stop), size/price/skew/trailing, quantity distribution, BBO, est. liq. price, confirm/disable confirmation, hidden/keep visible, max buy/sell, TP/SL (mark price, trigger description), form validation errors, slippage, scaled order toasts, reduce-only reminder.

## Exports

### `orderEntry`

Object of keys under `orderEntry.*`: e.g. `orderEntry.orderType.limit`, `orderEntry.quantityDistribution`, `orderEntry.orderQuantity.error.required`, `orderEntry.confirmScaledOrder.orderPrice.warning`.

### `OrderEntry` (type)

`typeof orderEntry`.
