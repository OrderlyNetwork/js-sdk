# order

## Overview

Order-related calculations: price bounds (max/min/scope), order fee, estimated liquidation price, estimated leverage, and TP/SL ROI. Depends on `@orderly.network/types`, `@orderly.network/utils`, and `positions.notional`.

## Types

### EstimatedLiquidationPriceInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCollateral` | `number` | Yes | Total collateral. |
| `markPrice` | `number` | Yes | Mark price. |
| `baseMMR` | `number` | Yes | Base MMR. |
| `baseIMR` | `number` | Yes | Base IMR. |
| `IMR_Factor` | `number` | Yes | IMR factor. |
| `orderFee` | `number` | Yes | Order fee. |
| `positions` | `Array<Pick<PositionExt, "position_qty" \| "mark_price" \| "symbol" \| "mmr">>` | Yes | Existing positions. |
| `newOrder` | `{ symbol: string; qty: number; price: number }` | Yes | New order. |

### EstimatedLeverageInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCollateral` | `number` | Yes | Total collateral. |
| `positions` | `Array<Pick<PositionExt, "position_qty" \| "mark_price" \| "symbol">>` | Yes | Positions. |
| `newOrder` | `{ symbol: string; qty: number; price: number }` | Yes | New order. |

## Exports (functions)

| Function | Description |
|----------|-------------|
| `maxPrice(markprice, range)` | Maximum allowed price: `markprice * (1 + range)`. |
| `minPrice(markprice, range)` | Minimum allowed price: `markprice * (1 - range)`. |
| `scopePrice(price, scope, side)` | Scope price: BUY `price * (1 - scope)`, SELL `price * (1 + scope)`. |
| `orderFee(inputs)` | Order fee = qty × price × futuresTakeFeeRate. |
| `estLiqPrice(inputs)` | Estimated liquidation price including new order. |
| `estLeverage(inputs)` | Estimated leverage (1 / totalMarginRatio); null if no collateral or notional. |
| `tpslROI(inputs)` | TP/SL ROI: (closePrice − orderPrice) / orderPrice × leverage × direction (uses `getTPSLDirection` from utils). |

## Usage example

```typescript
import { order } from "@orderly.network/perp";

const max = order.maxPrice(2000, 0.05);   // 2100
const min = order.minPrice(2000, 0.05);   // 1900
const scopeBuy = order.scopePrice(2000, 0.01, "BUY");  // 1980

const fee = order.orderFee({
  qty: 1,
  price: 2000,
  futuresTakeFeeRate: 0.0005,
});

const liqPrice = order.estLiqPrice({
  totalCollateral: 5000,
  markPrice: 2000,
  baseMMR: 0.02,
  baseIMR: 0.1,
  IMR_Factor: 0.0001,
  orderFee: 1,
  positions: [],
  newOrder: { symbol: "PERP_ETH_USDC", qty: 1, price: 2000 },
});

const lev = order.estLeverage({
  totalCollateral: 5000,
  positions: [],
  newOrder: { symbol: "PERP_ETH_USDC", qty: 1, price: 2000 },
});

const roi = order.tpslROI({
  side: OrderSide.BUY,
  type: "tp",
  closePrice: 2100,
  orderPrice: 2000,
  leverage: 10,
});
```
