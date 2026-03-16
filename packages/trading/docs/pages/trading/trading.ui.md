# trading.ui

## Overview

Responsive container: chooses desktop or mobile layout based on `useScreen().isMobile` and forwards full `TradingState` to the selected layout.

## Exports

### Trading

**Type**: `FC<TradingState>`

- If mobile: renders `MobileLayout` with props.
- Otherwise: renders `DesktopLayout` with props and optional `className` for height/background.

## Usage example

Used internally by `TradingWidget`; state comes from `useTradingScript()`.
