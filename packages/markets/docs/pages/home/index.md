# home

## Overview

Markets home page and its sections: header (with symbol/search), data list (full and mobile), and funding (overview/comparison). Uses lazy-loaded widgets and responsive tabs.

## Files

| File | Language | Description | Link |
|------|----------|-------------|------|
| `page.tsx` | React/TSX | `MarketsHomePage` – top-level page with Markets/Funding tabs, desktop/mobile layout | [page.md](./page.md) |
| `marketsHeader/marketsHeader.widget.tsx` | React/TSX | Header widget (lazy) | - |
| `marketsHeader/marketsHeader.ui.tsx` | React/TSX | Header UI | - |
| `marketsHeader/marketsHeader.script.tsx` | TypeScript | Header script | - |
| `marketsHeader/marketsHeader.mobile.ui.tsx` | React/TSX | Mobile header UI | - |
| `marketsDataList/marketsDataList.widget.tsx` | React/TSX | Data list widget (lazy) | - |
| `marketsDataList/marketsDataList.ui.tsx` | React/TSX | Data list UI | - |
| `marketsDataList/marketsDataList.script.ts` | TypeScript | Data list script | - |
| `marketsDataList/marketsDataList.mobile.ui.tsx` | React/TSX | Mobile data list UI | - |
| `funding/funding.widget.tsx` | React/TSX | Funding tab widget (lazy) | - |
| `funding/funding.ui.tsx` | React/TSX | Funding UI | - |
| `funding/funding.script.tsx` | TypeScript | Funding script | - |
| `funding/funding.mobile.ui.tsx` | React/TSX | Mobile funding UI | - |

## Page props (MarketsHomePageProps)

Extends `MarketsProviderProps` plus:

| Prop | Type | Description |
|------|------|-------------|
| `className` | string | Optional class for the page container |

`MarketsProvider` receives: `symbol`, `onSymbolChange`, `navProps`, `comparisonProps`.

## Usage example

```tsx
import { MarketsHomePage } from "@orderly.network/markets";

<MarketsHomePage
  symbol={symbol}
  onSymbolChange={setSymbol}
  navProps={{ leftNav: {...}, routerAdapter }}
  comparisonProps={{ exchangesName: "Orderly", exchangesIconSrc: "..." }}
/>
```
