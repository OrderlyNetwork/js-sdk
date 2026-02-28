# trading.ui.desktop

## Overview

Desktop trading layout: renders the main trading view with resizable/sortable panels (order book, trades, data list, trading view, order entry), symbol bar, and layout switcher. Uses split layout and persistent sizes.

## Exports

### DesktopLayoutProps

**Type**: `TradingState & { className?: string }`

### DesktopLayout

**Type**: `React.FC<DesktopLayoutProps>`

Desktop layout component that composes symbol bar, split panels, order book & trades, data list, trading view, and order entry based on `TradingState`.
