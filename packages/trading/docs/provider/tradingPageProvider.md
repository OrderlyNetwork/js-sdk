# tradingPageProvider

## Overview

Provider component that resolves symbol info for the current `symbol` and supplies `TradingPageState` (props + `symbolInfo`) to the trading page via `TradingPageContext`.

## Exports

### TradingPageProvider

**Type**: `FC<PropsWithChildren<TradingPageProps>>`

Uses `useSymbolsInfo()[symbol]` and `getBasicSymbolInfo` to build `symbolInfo`, then memoizes full state and passes it to `TradingPageContext.Provider`.

## Usage example

```tsx
import { TradingPageProvider } from "@orderly.network/trading";

<TradingPageProvider symbol="PERP_ETH_USDC" tradingViewConfig={config}>
  <TradingWidget />
</TradingPageProvider>
```
