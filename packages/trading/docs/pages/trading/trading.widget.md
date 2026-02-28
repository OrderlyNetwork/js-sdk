# trading.widget

## Overview

Connects trading script state to the responsive trading UI. Uses `useTradingScript()` and renders `Trading` with that state (no own props).

## Exports

### TradingWidget

**Type**: `React.FC` (no props)

Renders `<Trading {...state} />` where `state` is the return value of `useTradingScript()`.

## Usage example

```tsx
import { TradingWidget } from "@orderly.network/trading";

<TradingPageProvider ...>
  <TradingWidget />
</TradingPageProvider>
```
