# usePendingOrderCount

## Overview

Returns the count of pending orders and TP/SL orders, optionally scoped by symbol, respecting the "show all symbol" setting from trading local storage.

## Exports

### usePendingOrderCount

**Signature**

```ts
usePendingOrderCount(symbol?: string): {
  pendingOrderCount: number;
  tpSlOrderCount: number;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| symbol | string? | Filter by symbol; when `showAllSymbol` is true, symbol is ignored and counts are global |

**Returns**: `pendingOrderCount` (incomplete orders excluding positional TP/SL), `tpSlOrderCount` (incomplete TP/SL orders). Values are stabilized via `useDataTap`.

## Usage example

```typescript
import { usePendingOrderCount } from "@orderly.network/trading";

const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount("PERP_ETH_USDC");
```
