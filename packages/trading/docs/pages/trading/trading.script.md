# trading.script

## Overview

Main trading layout and market state hook plus shared layout constants. Manages order entry/market position, panel visibility, first-time deposit, and responsive breakpoints.

## Exports

### TradingState

**Type**: `ReturnType<typeof useTradingScript>`

State object passed to `Trading` and desktop/mobile layouts (e.g. layout, market position, open sheets, sizes).

### useTradingScript

**Signature**: `useTradingScript(): TradingState`

Consumes `useTradingPageContext`, `useAccount`, `useAppContext`, `useTradingLocalStorage`, `useFirstTimeDeposit`, `useCollateral`, media queries, and local storage for layout/market position. Returns state for panels, order entry/markets layout, openMarketsSheet, sizes, etc.

### Layout constants

| Name | Type | Description |
|------|------|-------------|
| scrollBarWidth | number | 6 |
| topBarHeight | number | 48 |
| bottomBarHeight | number | 29 |
| space | number | 8 |
| symbolInfoBarHeight | number | 54 |
| orderEntryMinWidth / orderEntryMaxWidth | number | 280 / 360 |
| orderbookMinWidth / orderbookMaxWidth | number | 280 / 732 |
| orderbookMinHeight / orderbookMaxHeight | number | 464 / 728 |
| tradindviewMinHeight | number | 320 |
| tradingViewMinWidth | number | 540 |
| dataListMaxHeight / dataListInitialHeight | number | 800 / 350 |

### MarketLayoutPosition

**Type**: `"left" | "top" | "bottom" | "hide"`

### getOffsetSizeNum

**Signature**: `getOffsetSizeNum(size: string | null): number`

Parses a size string (e.g. from layout) to a number.

## Usage example

```tsx
import { useTradingScript } from "@orderly.network/trading";

const state = useTradingScript();
// state.layout, state.openMarketsSheet, state.setOpenMarketsSheet, ...
```
