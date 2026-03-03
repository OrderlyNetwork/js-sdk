# page.tsx (MarketsHomePage)

## Overview

Top-level markets home page. Renders `MarketsProvider` and either desktop or mobile content: tabs for "Markets" and "Funding", with lazy-loaded header, data list, and funding widgets.

## Props (MarketsHomePageProps)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | string | No | Current symbol (passed to MarketsProvider) |
| `onSymbolChange` | (symbol: API.Symbol) => void | No | Called when symbol changes |
| `navProps` | object | No | Mobile: `logo`, `routerAdapter`, `leftNav` |
| `comparisonProps` | object | No | Funding comparison: `exchangesName`, `exchangesIconSrc` |
| `className` | string | No | Container class |

## Behavior

- Uses `useScreen().isMobile` to switch between `MarketsMobileContent` and `MarketsDesktopContent`.
- Desktop: `Tabs` with `TabPanel` for Markets and Funding; each panel uses `React.Suspense` and lazy widgets.
- Mobile: Same tabs with `LeftNavUI` in `leading` when `navProps.leftNav` is provided.

## Usage example

```tsx
import { MarketsHomePage } from "@orderly.network/markets";

<MarketsHomePage symbol={symbol} onSymbolChange={setSymbol} />
```
