# account

## Overview

Account and collateral calculations: total value, free collateral, total collateral, initial margin (IMR), position/order notional, max order quantity, margin ratio, maintenance margin ratio (MMR), LTV, withdrawal limits, and related filters/helpers. Uses `@orderly.network/types` and `@orderly.network/utils`.

## Types

### ResultOptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dp` | `number` | Yes | Decimal places for result. |

### TotalValueInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalUnsettlementPnL` | `number` | Yes | Total unsettled PnL. |
| `USDCHolding` | `number` | Yes | USDC balance. |
| `nonUSDCHolding` | `Array<{ holding: number; indexPrice: number }>` | Yes | Non-USDC holdings with index price. |

### FreeCollateralInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCollateral` | `Decimal` | Yes | Total collateral. |
| `totalInitialMarginWithOrders` | `number` | Yes | Total initial margin including orders. |

### TotalCollateralValueInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `USDCHolding` | `number` | Yes | USDC balance. |
| `nonUSDCHolding` | `Array<{ holding, indexPrice, collateralCap, collateralRatio }>` | Yes | Non-USDC with cap and ratio. |
| `unsettlementPnL` | `number` | Yes | Unsettled PnL. |

### PositionNotionalWithOrderInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `markPrice` | `number` | Yes | Mark price. |
| `positionQtyWithOrders` | `number` | Yes | Position qty plus orders qty. |

### PositionQtyWithOrderInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionQty` | `number` | Yes | Position quantity. |
| `buyOrdersQty` | `number` | Yes | Total buy order quantity. |
| `sellOrdersQty` | `number` | Yes | Total sell order quantity. |

### IMRInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `maxLeverage` | `number` | Yes | Effective max leverage. |
| `baseIMR` | `number` | Yes | Base IMR. |
| `IMR_Factor` | `number` | Yes | IMR factor. |
| `positionNotional` | `number` | Yes | Position notional. |
| `ordersNotional` | `number` | Yes | Orders notional. |
| `IMR_factor_power` | `number` | No | Power for IMR factor (default from constants). |

### TotalInitialMarginWithOrdersInputs

Extends `Pick<IMRInputs, "maxLeverage">` with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positions` | `API.Position[]` | Yes | All positions. |
| `orders` | `API.Order[]` | Yes | All orders. |
| `markPrices` | `Record<string, number>` | Yes | Mark price per symbol. |
| `symbolInfo` | `any` | Yes | Symbol info accessor. |
| `IMR_Factors` | `Record<string, number>` | Yes | IMR factor per symbol. |

### OtherIMsInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positions` | `API.Position[]` | Yes | Positions (other symbols). |
| `markPrices` | `Record<string, number>` | Yes | Mark prices. |
| `maxLeverage` | `number` | Yes | Account max leverage. |
| `symbolInfo` | `any` | Yes | Symbol info. |
| `IMR_Factors` | `Record<string, number>` | Yes | IMR factors. |

### MaxQtyInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `symbol` | `string` | Yes | Symbol. |
| `baseMaxQty` | `number` | Yes | Base max quantity (e.g. from /v1/public/info). |
| `totalCollateral` | `number` | Yes | Total collateral (see `totalCollateral`). |
| `maxLeverage` | `number` | Yes | Max leverage. |
| `baseIMR` | `number` | Yes | Base IMR. |
| `otherIMs` | `number` | Yes | Other symbols' margin (see `otherIMs`). |
| `markPrice` | `number` | Yes | Mark price. |
| `positionQty` | `number` | Yes | Current position qty. |
| `buyOrdersQty` | `number` | Yes | Long orders qty. |
| `sellOrdersQty` | `number` | Yes | Short orders qty. |
| `IMR_Factor` | `number` | Yes | IMR factor. |
| `takerFeeRate` | `number` | Yes | Taker fee rate. |

### TotalMarginRatioInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCollateral` | `number` | Yes | Total collateral. |
| `markPrices` | `Record<string, number>` | Yes | Mark prices. |
| `positions` | `API.Position[]` | Yes | Positions. |

### TotalUnrealizedROIInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalUnrealizedPnL` | `number` | Yes | Total unrealized PnL. |
| `totalValue` | `number` | Yes | Total value. |

### AvailableBalanceInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `USDCHolding` | `number` | Yes | USDC balance. |
| `unsettlementPnL` | `number` | Yes | Unsettled PnL. |

### AccountMMRInputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionsMMR` | `number` | Yes | Total maintenance margin (USDC). |
| `positionsNotional` | `number` | Yes | Total positions notional. |

## Functions

| Function | Description |
|----------|-------------|
| `totalValue(inputs)` | User's total asset value in USDC (including non-collateral assets). |
| `freeCollateral(inputs)` | Available collateral (total collateral − initial margin with orders), min 0. |
| `totalCollateral(inputs)` | Total collateral from USDC, non-USDC (capped, weighted), and unsettlement PnL. |
| `positionNotionalWithOrder_by_symbol(inputs)` | Sum of position + orders notional for a symbol. |
| `positionQtyWithOrders_by_symbol(inputs)` | Position qty + orders qty (signed logic for long/short). |
| `IMR(inputs)` | Initial margin rate: max(1/maxLeverage, baseIMR, IMR_Factor × |notional|^power). |
| `buyOrdersFilter_by_symbol(orders, symbol)` | Filter orders to buy side for symbol. |
| `sellOrdersFilter_by_symbol(orders, symbol)` | Filter orders to sell side for symbol. |
| `getQtyFromPositions(positions, symbol)` | Get position qty for symbol. |
| `getQtyFromOrdersBySide(orders, symbol, side)` | Get total order qty for symbol and side. |
| `getPositonsAndOrdersNotionalBySymbol(inputs)` | Notional for position + orders for a symbol. |
| `totalInitialMarginWithOrders(inputs)` | **(Deprecated)** Total initial margin (positions + orders). |
| `totalInitialMarginWithQty(inputs)` | Total initial margin using position pending long/short qty. |
| `groupOrdersBySymbol(orders)` | Group orders by symbol. |
| `extractSymbols(positions, orders)` | Unique symbols from positions and orders. |
| `otherIMs(inputs)` | Total margin used by other symbols (excluding current). |
| `maxQty(side, inputs, options?)` | Max order quantity (delegates to maxQtyByLong / maxQtyByShort). |
| `maxQtyByLong(inputs, options?)` | Max quantity for long. |
| `maxQtyByShort(inputs, options?)` | Max quantity for short. |
| `totalMarginRatio(inputs, dp?)` | Total margin ratio (totalCollateral / total position notional). |
| `totalUnrealizedROI(inputs)` | Total unrealized ROI. |
| `currentLeverage(totalMarginRatio)` | Current account leverage (1 / totalMarginRatio). |
| `availableBalance(inputs)` | USDC + unsettlement PnL. |
| `MMR(inputs)` | Maintenance margin ratio (positionsMMR / positionsNotional); null if no positions. |
| `collateralRatio(params)` | Collateral ratio from baseWeight, discountFactor, qty, cap, indexPrice. |
| `collateralContribution(params)` | Collateral value: min(qty, cap) × ratio × indexPrice. |
| `LTV(params)` | LTV from USDC balance, UPNL, and assets (qty, indexPrice, weight). |
| `maxWithdrawalUSDC(inputs)` | max(0, min(USDC_balance, free_collateral − max(upnl, 0))). |
| `maxWithdrawalOtherCollateral(inputs)` | Max withdrawal for other collateral (with buffer when USDC negative). |
| `calcMinimumReceived(inputs)` | Minimum received after slippage. |
| `maxLeverage(inputs)` | **(Deprecated)** Prefer symbol leverage; returns symbolLeverage ?? 1. |

## Usage example

```typescript
import { account } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";

const totalVal = account.totalValue({
  totalUnsettlementPnL: 100,
  USDCHolding: 1000,
  nonUSDCHolding: [{ holding: 1, indexPrice: 50 }],
});

const free = account.freeCollateral({
  totalCollateral: new Decimal(5000),
  totalInitialMarginWithOrders: 2000,
});

const imr = account.IMR({
  maxLeverage: 10,
  baseIMR: 0.1,
  IMR_Factor: 0.0001,
  positionNotional: 10000,
  ordersNotional: 0,
});

const maxLong = account.maxQtyByLong({
  symbol: "PERP_ETH_USDC",
  baseMaxQty: 100,
  totalCollateral: 5000,
  maxLeverage: 10,
  baseIMR: 0.1,
  otherIMs: 0,
  markPrice: 2000,
  positionQty: 0,
  buyOrdersQty: 0,
  sellOrdersQty: 0,
  IMR_Factor: 0.0001,
  takerFeeRate: 0.0005,
});
```
