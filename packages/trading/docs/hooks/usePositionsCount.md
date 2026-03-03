# usePositionsCount

## Overview

Returns the number of open positions, optionally filtered by symbol, respecting the "show all symbol" setting.

## Exports

### usePositionsCount

**Signature**

```ts
usePositionsCount(symbol?: string): { positionCount: number }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| symbol | string? | Filter by symbol; when `showAllSymbol` is true, counts all positions |

**Returns**: `positionCount` (stabilized via `useDataTap`).

## Usage example

```typescript
import { usePositionsCount } from "@orderly.network/trading";

const { positionCount } = usePositionsCount("PERP_ETH_USDC");
```
