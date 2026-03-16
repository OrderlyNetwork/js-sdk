# en

## Overview

Default English locale object. Built by merging all message modules from `locale/module/` (common, markets, portfolio, trading, chart, positions, orders, tpsl, share, orderEntry, leverage, scaffold, tradingRewards, tradingView, connector, transfer, affiliate, ui, tradingLeaderboard, tradingPoints, widget, vaults, notification). Used as the initial `resources[defaultLng][defaultNS]` and as the type source for `LocaleMessages`.

## Exports

### `en`

A flat object of translation keys to English strings, e.g. `"common.cancel": "Cancel"`, `"markets.favorites": "Favorites"`. Keys follow the pattern `module.subkey` or `module.subkey.nested`.

## Usage example

```typescript
import { en } from "@orderly.network/i18n";

// Used internally by i18n and LocaleProvider; or for type derivation
const cancelText = en["common.cancel"];
```
