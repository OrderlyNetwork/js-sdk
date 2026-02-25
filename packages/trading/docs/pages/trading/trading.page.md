# trading.page

## Overview

Root trading page component. Accepts `TradingPageProps`, wraps the tree in `TradingPageProvider`, and renders `TradingWidget` so the full trading UI runs with the correct symbol and config.

## Exports

### TradingPage

**Type**: `React.FC<TradingPageProps>`

Passes through `symbol`, `tradingViewConfig`, `onSymbolChange`, `disableFeatures`, `overrideFeatures`, `referral`, `tradingRewards`, `bottomSheetLeading`, `sharePnLConfig` to the provider.

## Usage example

```tsx
import { TradingPage } from "@orderly.network/trading";

<TradingPage
  symbol="PERP_ETH_USDC"
  tradingViewConfig={tradingViewConfig}
  onSymbolChange={onSymbolChange}
  disableFeatures={[TradingFeatures.Footer]}
/>
```
