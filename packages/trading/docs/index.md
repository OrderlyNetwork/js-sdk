# Trading Package — Documentation Index

> Source: `packages/trading/src`

This directory contains the trading UI package: trading page, order book, data list, layout, and mobile/desktop components.

## Top-level files

| File | Language | Description |
|------|----------|-------------|
| [index.ts](../src/index.ts) | TypeScript | Package entry: re-exports types, components, pages, provider, hooks |
| [version.ts](version.md) | TypeScript | Package version and `window.__ORDERLY_VERSION__` registration |

## Subdirectories

| Directory | Description |
|-----------|-------------|
| [types/](types/index.md) | Trading page and layout types (`TradingPageProps`, `ShareOptions`, `TradingFeatures`, etc.) |
| [utils/](utils/index.md) | Symbol info helpers (`getBasicSymbolInfo`) |
| [hooks/](hooks/index.md) | Trading-specific hooks (local storage, pending order count, positions count, RWA countdown) |
| [provider/](provider/index.md) | `TradingPageProvider` and `TradingPageContext` |
| [pages/](pages/index.md) | Trading page and widget (`TradingPage`, `TradingWidget`, `Trading`, `useTradingScript`) |
| [components/](components/index.md) | Base, desktop, and mobile components (order book, data list, layout, portfolio, etc.) |
