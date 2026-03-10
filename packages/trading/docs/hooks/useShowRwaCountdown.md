# useShowRwaCountdown

## Overview

Determines whether to show the RWA (real-world asset) symbol close countdown for a given symbol. Uses `useGetRwaSymbolCloseTimeInterval` and supports manually closing the countdown.

## Exports

### useShowRwaCountdown

**Signature**

```ts
useShowRwaCountdown(symbol: string): {
  showCountdown: boolean | undefined;
  closeCountdown: () => void;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| symbol | string | Symbol to check for RWA and close interval |

**Returns**: `showCountdown` (true when RWA, open, and has close interval; undefined before resolved). `closeCountdown` sets countdown to hidden and marks as manually closed (resets on symbol change).

## Usage example

```typescript
import { useShowRwaCountdown } from "@orderly.network/trading/hooks";

const { showCountdown, closeCountdown } = useShowRwaCountdown("RWA_SYMBOL");
```
