# pages/trading

Trading page: provider-wrapped page, widget that uses script + UI, responsive layout (desktop/mobile), and script hook with layout/market state.

## Files

| File | Language | Description |
|------|----------|-------------|
| [index.ts](index.md) | TypeScript | Re-exports `Trading`, `TradingWidget`, `TradingPage`, `useTradingScript` |
| [trading.page.tsx](trading.page.md) | TSX | `TradingPage`: wraps with `TradingPageProvider` and renders `TradingWidget` |
| [trading.widget.tsx](trading.widget.md) | TSX | `TradingWidget`: uses `useTradingScript` and renders `Trading` |
| [trading.ui.tsx](trading.ui.md) | TSX | `Trading`: picks `DesktopLayout` or `MobileLayout` via `useScreen` |
| [trading.script.tsx](trading.script.md) | TSX | `useTradingScript`, `TradingState`, layout constants, market layout state |
| [trading.ui.desktop.tsx](trading.ui.desktop.md) | TSX | `DesktopLayout`: desktop trading layout and panels |
| [trading.ui.mobile.tsx](trading.ui.mobile.md) | TSX | `MobileLayout`: mobile trading layout |
| [hooks/useFirstTimeDeposit.ts](hooks/useFirstTimeDeposit.md) | TypeScript | Hook: true when first-time user with no deposits and trading enabled |
