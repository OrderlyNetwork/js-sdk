# layout

## Overview

Portfolio layout: desktop/mobile scaffold with left sidebar (overview, positions, orders, assets, fee tier, API key, setting, history), layout context (sidebar open state, router adapter), and widget that switches by screen size.

## Files

| File | Language | Description |
|------|----------|-------------|
| [exports.md](exports.md) | TS | Re-exports layout widget, layout UI, script. |
| [context.tsx](context.md) | TSX | Layout context and LayoutProvider. |
| [layout.ui.tsx](layout.ui.md) | TSX | Desktop PortfolioLayout (Scaffold + SideBar). |
| [layout.ui.mobile.tsx](layout.ui.mobile.md) | TSX | Mobile layout. |
| [layout.widget.tsx](layout.widget.md) | TSX | PortfolioLayoutWidget (desktop/mobile switch). |
| [layout.script.tsx](layout.script.md) | TSX | usePortfolioLayoutScript, PortfolioLeftSidebarPath. |
