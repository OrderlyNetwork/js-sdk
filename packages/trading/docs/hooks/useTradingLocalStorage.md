# useTradingLocalStorage

## Overview

Hook that persists trading UI preferences in local storage: PnL price basis, notional decimal precision, show-all-symbol, and hide-assets flags.

## Exports

### useTradingLocalStorage

**Signature**

```ts
useTradingLocalStorage(props?: { pnlNotionalDecimalPrecision?: number }): {
  unPnlPriceBasis: string;
  setUnPnlPriceBasic: (v: string) => void;
  pnlNotionalDecimalPrecision: number;
  setPnlNotionalDecimalPrecision: (v: number) => void;
  showAllSymbol: boolean;
  setShowAllSymbol: (v: boolean) => void;
  hideAssets: boolean;
  setHideAssets: (v: boolean) => void;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| props | object? | Optional; `pnlNotionalDecimalPrecision` used as default (default 2) |

**Returns**: Getters and setters for each key; values are synced to `localStorage` via `@orderly.network/hooks` `useLocalStorage`.

## Usage example

```typescript
import { useTradingLocalStorage } from "@orderly.network/trading";

const {
  unPnlPriceBasis,
  setUnPnlPriceBasic,
  showAllSymbol,
  setShowAllSymbol,
} = useTradingLocalStorage();
```
