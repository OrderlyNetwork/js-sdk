# types

## Overview

Defines types and interfaces for the trading page: props, feature flags, share/PnL layout, trading view config, and referral/rewards.

## Exports

### layoutInfo

Layout descriptor for canvas/text positioning and styling.

| Property | Type | Description |
|----------|------|-------------|
| width | number? | Width |
| height | number? | Height |
| fontSize | number? | Font size |
| color | string? | Text color |
| textAlign | CanvasTextAlign? | Text alignment |
| textBaseline | CanvasTextBaseline? | Text baseline |
| position | Partial<{ left, right, top, bottom }> | Position (required) |

### PosterLayoutConfig

Layout configuration for PnL share poster (message, domain, position, unrealizedPnl, informations, updateTime).

### ShareOptions

Options for PnL share feature (e.g. font, background images, layout, colors).

| Property | Type | Description |
|----------|------|-------------|
| pnl | object | `fontFamily`, `backgroundImages`, `layout`, `color`, `profitColor`, `lossColor`, `brandColor` |

### TradingFeatures (enum)

Feature flags for the trading page: `Sider`, `TopNavBar`, `Footer`, `Header`, `Kline`, `OrderBook`, `TradeHistory`, `Positions`, `Orders`, `AssetAndMarginInfo`, `SlippageSetting`, `FeesInfo`.

### BasicSymbolInfo

| Property | Type | Description |
|----------|------|-------------|
| base_dp | number | Base decimal places |
| quote_dp | number | Quote decimal places |
| base_tick | number | Base tick size |
| base | string | Base symbol |
| quote | string | Quote symbol |

### TradingPageState

Extends `TradingPageProps` with `symbolInfo: { base_dp, quote_dp, base_tick, base, quote, symbol }`.

### TradingViewConfigInterface

TradingView chart config: `scriptSRC`, `library_path`, `overrides`, `studiesOverrides`, `customCssUrl`, `colorConfig`, `locale`, `enabled_features`, `disabled_features`.

### ColorConfigInterface

Chart colors: `chartBG`, `upColor`, `downColor`, `pnlUpColor`, `pnlDownColor`, `pnlZoreColor`, `textColor`, `qtyTextColor`, `font`, `closeIcon`.

### ReferralProps

| Property | Type | Description |
|----------|------|-------------|
| saveRefCode | boolean? | Whether to save referral code |
| onClickReferral | () => void? | Callback when referral is clicked |
| onBoundRefCode | (success, error) => void? | Callback when ref code is bound |

### TradingRewardsProps

| Property | Type | Description |
|----------|------|-------------|
| onClickTradingRewards | () => void? | Callback when trading rewards is clicked |

### TradingPageProps

Base props: `symbol`, `tradingViewConfig`, `onSymbolChange?`, `disableFeatures?`, `overrideFeatures?`. Extended with: `sharePnLConfig?`, `referral?`, `tradingRewards?`, `bottomSheetLeading?`.

## Usage example

```typescript
import type {
  TradingPageProps,
  ShareOptions,
  TradingFeatures,
  TradingViewConfigInterface,
} from "@orderly.network/trading";

const props: TradingPageProps = {
  symbol: "PERP_ETH_USDC",
  tradingViewConfig: { library_path: "/tradingview/" },
  disableFeatures: [TradingFeatures.Footer],
};
```
