# index (entry)

## Overview

Barrel file for `@orderly.network/perp`. Re-exports the package version and namespaces for positions, account, and order utilities.

## Exports

| Export | Source | Description |
|--------|--------|-------------|
| `version` | `./version` | Default export: package version string (e.g. `"4.9.1"`). |
| `positions` | `./positions` | Namespace of position-related functions (notional, PnL, liquidation, MMR, etc.). |
| `account` | `./account` | Namespace of account/collateral/margin functions. |
| `orderUtils` | `./order` | Same module as `order`; alias for order utilities. |
| `order` | `./order` | Namespace of order-related functions (price, fee, est. liq price, leverage, TP/SL ROI). |

## Usage example

```typescript
import {
  version,
  positions,
  account,
  orderUtils,
  order,
} from "@orderly.network/perp";

console.log(version); // "4.9.1"
const notional = positions.notional(10, 100);
const freeCollateral = account.freeCollateral({ totalCollateral, totalInitialMarginWithOrders });
const fee = order.orderFee({ qty, price, futuresTakeFeeRate });
```
