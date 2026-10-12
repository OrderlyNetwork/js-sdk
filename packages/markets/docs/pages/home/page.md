# page.tsx — MarketsHomePage

## page.tsx Responsibilities

Exports `MarketsHomePage`, the main markets page component with built-in Prediction markets. Its base layout comes from `@orderly.network/markets-core`. It wraps content in `MarketsProvider`, renders a tabbed layout (Markets / Funding), and lazy-loads the markets header, markets data list, and funding widgets. Desktop and mobile layouts differ (Box + Tabs vs Tabs with leading nav).

## page.tsx Exports

| Name                 | Type | Role           | Description                                  |
| -------------------- | ---- | -------------- | -------------------------------------------- |
| MarketsHomePageProps | type | Props          | Extends MarketsProviderProps; adds className |
| MarketsHomePage      | FC   | Page component | Root markets page                            |

## MarketsHomePage Props

| Property              | Type                         | Required | Description                                                                  |
| --------------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------- |
| symbol                | string                       | No       | Current symbol (passed to MarketsProvider)                                   |
| onSymbolChange        | (symbol: API.Symbol) => void | No       | Symbol change callback                                                       |
| navProps              | object                       | No       | Mobile: logo, routerAdapter, leftNav                                         |
| comparisonProps       | object                       | No       | exchangesName, exchangesIconSrc                                              |
| className             | string                       | No       | Root div class                                                               |
| predictionEnabled     | boolean                      | No       | Defaults to true; requires application navigation or onPredictionSelect      |
| onPredictionSelect    | (symbol: string) => void     | No       | Receives the exact Prediction round symbol; overrides application navigation |
| tabs                  | MarketTabConfig[]            | No       | Overrides the default categories without automatic insertion                 |
| renderTabContent      | MarketTabContentRenderer     | No       | Custom content; undefined falls back to built-in Prediction, null hides it   |
| renderTabAfterContent | MarketTabContentRenderer     | No       | Overrides the appended content in All and favorites                          |

## MarketsHomePage Input/Output

- **Input**: MarketsHomePageProps (symbol, onSymbolChange, navProps, comparisonProps, className).
- **Output**: Renders MarketsProvider and a tabbed layout; Markets tab shows MarketsHeaderWidget + MarketsDataListWidget; Funding tab shows FundingWidget. Uses useScreen() to switch between desktop and mobile content.

## Render and State Flow

1. useScreen() determines isMobile.
2. activeTab state (MarketsPageTab) drives which tab is visible.
3. MarketsProvider receives symbol, onSymbolChange, navProps, comparisonProps.
4. Desktop: Box + Tabs with TabPanel for Markets and Funding; each panel uses React.Suspense around lazy widgets.
5. Mobile: Tabs with leading LeftNavUI when navProps.leftNav is set; same lazy widgets in each tab.

## Dependencies

- **Upstream**: React, @orderly.network/i18n (useTranslation), @orderly.network/types (RouterAdapter), @orderly.network/ui (Box, cn, TabPanel, Tabs, useScreen), @orderly.network/ui-scaffold (LeftNavProps, LeftNavUI), MarketsProvider from components, MarketsPageTab from type.
- **Downstream**: Apps that render the markets route (e.g. next or react-router).

## page.tsx Example

```tsx
import { MarketsHomePage } from "@orderly.network/markets";

<MarketsHomePage
  symbol={symbol}
  onSymbolChange={setSymbol}
  className="oui-min-h-screen"
/>;
```

## Built-in Prediction

With application navigation available, Prediction is inserted after Crypto and selection routes to `/prediction/<encoded-round-symbol>`. Pass `predictionEnabled={false}` to disable the built-in tab, appended All/favorites content, metadata request, and round clock. A custom `onPredictionSelect` also enables this integration without application navigation.

Prediction favorites are appended below the existing Perps favorites on desktop and mobile. They retain their own family-based storage and appear in every Perps favorite group. Both products share the search field. Existing exports such as `MarketsProvider` and `useMarketsContext` refer to the same Core implementations.

All markets appends Prediction below Perps even when search is empty. Search matches Prediction display names, family IDs, and underlying index symbols, ignoring case and surrounding whitespace. When only Prediction matches, the empty Perps table is hidden; when neither product matches, the existing empty state is shown.

The optional fourth argument to `renderTabAfterContent(tab, key, hide, context)` contains `{ searchValue?: string }`. Return `null` when no supplemental rows match so the host can retain its normal empty state. Existing three-argument callbacks remain compatible.
