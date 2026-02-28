# utils

## Overview

Provides a helper to derive `BasicSymbolInfo` from the symbol info accessor function used across the trading UI.

## Exports

### getBasicSymbolInfo

Builds a `BasicSymbolInfo` object from a symbol info getter.

**Signature**

```ts
getBasicSymbolInfo(
  symbolInfo: (key?: keyof API.SymbolExt, defaultValue?: ValueOf<API.SymbolExt>) => any
): BasicSymbolInfo
```

| Parameter | Type | Description |
|-----------|------|-------------|
| symbolInfo | function | Getter that returns `base_dp`, `quote_dp`, `base_tick`, `base`, `quote` for the current symbol |

**Returns**: `BasicSymbolInfo` with `base_dp`, `quote_dp`, `base_tick`, `base`, `quote`.

## Usage example

```typescript
import { getBasicSymbolInfo } from "@orderly.network/trading";
import { useSymbolsInfo } from "@orderly.network/hooks";

const symbolInfo = useSymbolsInfo()[symbol];
const basic = getBasicSymbolInfo(symbolInfo);
// basic.base_dp, basic.quote_dp, basic.base_tick, basic.base, basic.quote
```
