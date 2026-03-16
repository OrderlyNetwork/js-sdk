# tradingPageContext

## Overview

React context holding the trading page state (`TradingPageState`) and a hook to consume it.

## Exports

### TradingPageContext

**Type**: `React.Context<TradingPageState>`

Created with default value `{} as TradingPageState`. Must be used inside `TradingPageProvider`.

### useTradingPageContext

**Signature**

```ts
useTradingPageContext(): TradingPageState
```

Returns the current `TradingPageState` (symbol, tradingViewConfig, symbolInfo, disableFeatures, overrideFeatures, etc.).

## Usage example

```tsx
import { useTradingPageContext } from "@orderly.network/trading";

const props = useTradingPageContext();
const { symbol, symbolInfo, disableFeatures } = props;
```
