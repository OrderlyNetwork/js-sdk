# marketsProvider

## Overview

Provides markets context: current symbol, search value, symbol change callback, and optional nav/comparison props for mobile and funding comparison.

## Files

| File | Description |
|------|-------------|
| `index.tsx` | `MarketsContext`, `MarketsProvider`, `useMarketsContext`, `MarketsProviderProps` |

## Exports

### MarketsProviderProps

| Prop | Type | Description |
|------|------|-------------|
| `symbol` | string | Current selected symbol |
| `onSymbolChange` | (symbol: API.Symbol) => void | Called when user selects a symbol |
| `navProps` | object | Optional: `logo`, `routerAdapter`, `leftNav` for mobile |
| `comparisonProps` | object | Optional: `exchangesName`, `exchangesIconSrc` for funding comparison |

### MarketsContext state

- `symbol`, `searchValue`, `onSearchValueChange`, `clearSearchValue`, plus all `MarketsProviderProps`.

### Components & hooks

- **MarketsProvider**: Wraps children and provides context.
- **useMarketsContext**: Returns current context value.

## Usage example

```tsx
import { MarketsProvider, useMarketsContext } from "@orderly.network/markets";

<MarketsProvider symbol={symbol} onSymbolChange={setSymbol}>
  <YourMarketsUI />
</MarketsProvider>

function YourMarketsUI() {
  const { symbol, searchValue, onSearchValueChange } = useMarketsContext();
  // ...
}
```
