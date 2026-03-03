# chart.util

## Overview

Chart theme and symbol helpers: default color config, overrides builder for pane/series/volume, exchange prefix for symbol (Orderly), and chart background constant.

## Exports

### defaultColorConfig

`ColorConfigInterface`: upColor, downColor, chartBG, pnlUpColor, pnlDownColor, pnlZoreColor, textColor, qtyTextColor, font, volumeUpColor, volumeDownColor, closeIcon.

### getOveriides(colorConfig, isMobile?)

Returns `{ overrides, studiesOverrides }` for TradingView (pane background, candle colors, grid, font size, volume colors). Uses smaller font and hides series title on mobile when `isMobile` is true.

### EXCHANGE

Constant `"Orderly"`.

### withoutExchangePrefix(symbol)

Returns symbol without `"Orderly:"` prefix (e.g. `Orderly:PERP_BTC_USDC` → `PERP_BTC_USDC`).

### withExchangePrefix(symbol)

Returns symbol with `"Orderly:"` prefix if not already present.

### chartBG

Background color constant `"#131519"`.
