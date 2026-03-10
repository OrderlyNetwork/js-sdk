# orderBook.ui

## Overview

Responsive order book container. Uses `OrderBookState` (from `useOrderBookScript`) and `isMobile` to render either the mobile order book or the desktop order book with the same data (levels, asks, bids, mark price, last price, depth, etc.).

## Exports

### OrderBook

**Type**: `React.FC<OrderBookState & { className?: string }>`

Renders `MWebOrderBook` (mobile) or `DesktopOrderBook` (desktop) with props from state.

## Usage example

Typically used via `OrderBookWidget`, which uses `useOrderBookScript` and passes state to `OrderBook`.
