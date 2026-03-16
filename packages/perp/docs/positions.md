# positions

## Overview

Position-level calculations: notional, unrealized PnL, liquidation price, maintenance margin (MM) and MMR, unsettlement PnL, TP/SL estimates, and max position notional/leverage. Uses `@orderly.network/types`, `@orderly.network/utils`, and `utils.DMax`.

## Types

### UnrealPnLInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `markPrice` | `number` | Yes | Mark price. |
| `openPrice` | `number` | Yes | Open/average price. |
| `qty` | `number` | Yes | Position quantity. |

### UnrealPnLROIInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionQty` | `number` | Yes | Position quantity. |
| `openPrice` | `number` | Yes | Open price. |
| `IMR` | `number` | Yes | IMR. |
| `unrealizedPnL` | `number` | Yes | Unrealized PnL. |

### UnsettlementPnLInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionQty` | `number` | Yes | Position quantity. |
| `markPrice` | `number` | Yes | Mark price. |
| `costPosition` | `number` | Yes | Cost of position. |
| `sumUnitaryFunding` | `number` | Yes | Sum unitary funding. |
| `lastSumUnitaryFunding` | `number` | Yes | Last sum unitary funding. |

### TotalUnsettlementPnLInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positions` | `(API.Position & { sum_unitary_funding: number })[]` | Yes | Positions with funding. |
| `sumUnitaryFunding` | `number` | Yes | Sum unitary funding. |

### MMInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionQty` | `number` | Yes | Position quantity. |
| `markPrice` | `number` | Yes | Mark price. |
| `MMR` | `number` | Yes | Maintenance margin rate. |

### MMRInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `baseMMR` | `number` | Yes | Base MMR. |
| `baseIMR` | `number` | Yes | Base IMR. |
| `IMRFactor` | `number` | Yes | IMR factor. |
| `positionNotional` | `number` | Yes | Position notional. |
| `IMR_factor_power` | `number` | No | Power (default from constants). |

## Exports (functions)

| Function | Description |
|----------|-------------|
| `notional(qty, mark_price)` | Single position notional: \|qty × mark_price\|. |
| `totalNotional(positions)` | Sum of notional over all positions. |
| `unrealizedPnL(inputs)` | Unrealized PnL: qty × (markPrice − openPrice). |
| `unrealizedPnLROI(inputs)` | Unrealized PnL ROI. |
| `totalUnrealizedPnL(positions)` | Total unrealized PnL over positions. |
| `liqPrice(inputs)` | Liquidation price (binary search over MM vs collateral); null if no position or no collateral. |
| `maintenanceMargin(inputs)` | Maintenance margin: \|positionQty × markPrice × MMR\|. |
| `unsettlementPnL(inputs)` | Unsettlement PnL per position (mark, cost, funding). |
| `totalUnsettlementPnL(positions)` | Total unsettlement PnL (positions must include funding fields). |
| `MMR(inputs)` | MMR: max(baseMMR, baseMMR/baseIMR × IMRFactor × \|notional\|^power). |
| `estPnLForTP(inputs)` | PnL for take profit: positionQty × (price − entryPrice). |
| `estPriceForTP(inputs)` | Price for TP given PnL: pnl/positionQty + entryPrice. |
| `estOffsetForTP(inputs)` | Offset for TP: price / entryPrice. |
| `estPriceFromOffsetForTP(inputs)` | Price from offset for TP: `offset + entryPrice`. |
| `estPnLForSL(inputs)` | Placeholder; returns 0. |
| `maxPositionNotional(inputs)` | Max position notional: (1 / (leverage × IMRFactor))^(1/0.8). |
| `maxPositionLeverage(inputs)` | Max symbol leverage: 1 / (IMRFactor × notional^0.8). |

## Usage example

```typescript
import { positions } from "@orderly.network/perp";

const n = positions.notional(10, 2000);
const totalN = positions.totalNotional(positionsList);

const upnl = positions.unrealizedPnL({
  markPrice: 2050,
  openPrice: 2000,
  qty: 10,
});

const liq = positions.liqPrice({
  markPrice: 2000,
  symbol: "PERP_ETH_USDC",
  totalCollateral: 5000,
  positionQty: 1,
  positions: positionsList,
  MMR: 0.02,
  baseMMR: 0.02,
  baseIMR: 0.1,
  IMRFactor: 0.0001,
  costPosition: 2000,
});

const mm = positions.maintenanceMargin({
  positionQty: 1,
  markPrice: 2000,
  MMR: 0.02,
});

const mmr = positions.MMR({
  baseMMR: 0.02,
  baseIMR: 0.1,
  IMRFactor: 0.0001,
  positionNotional: 2000,
});

const tpPnl = positions.estPnLForTP({
  positionQty: 1,
  entryPrice: 2000,
  price: 2100,
});
```
