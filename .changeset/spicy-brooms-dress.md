---
"@orderly.network/ui-order-entry": patch
"@orderly.network/ui-tradingview": patch
"@orderly.network/trading": patch
"@orderly.network/ai-docs": patch
"@orderly.network/storybook": patch
"@orderly.network/affiliate": patch
"@orderly.network/react-app": patch
"@orderly.network/chart": patch
"@orderly.network/devkit": patch
"@orderly.network/core": patch
"@orderly.network/default-evm-adapter": patch
"@orderly.network/default-solana-adapter": patch
"@orderly.network/hooks": patch
"@orderly.network/i18n": patch
"@orderly.network/layout-core": patch
"@orderly.network/layout-grid": patch
"@orderly.network/layout-split": patch
"@orderly.network/markets": patch
"@orderly.network/net": patch
"@orderly.network/perp": patch
"@orderly.network/plugin-core": patch
"@orderly.network/portfolio": patch
"@orderly.network/sdk-docs": patch
"storybook-theme-tool": patch
"@orderly.network/trading-leaderboard": patch
"@orderly.network/trading-next": patch
"@orderly.network/trading-rewards": patch
"tsconfig": patch
"@orderly.network/types": patch
"@orderly.network/ui": patch
"@orderly.network/ui-chain-selector": patch
"@orderly.network/ui-connector": patch
"@orderly.network/ui-leverage": patch
"@orderly.network/ui-notification": patch
"@orderly.network/ui-orders": patch
"@orderly.network/ui-positions": patch
"@orderly.network/ui-scaffold": patch
"@orderly.network/ui-share": patch
"@orderly.network/ui-tpsl": patch
"@orderly.network/ui-transfer": patch
"@orderly.network/utils": patch
"@orderly.network/vaults": patch
"@orderly.network/wallet-connector": patch
"@orderly.network/wallet-connector-privy": patch
"@orderly.network/web3-provider-ethers": patch
---

Add interceptor sockets so plugins can extend the trading screen without forking the SDK. Each is additive and defaults to passthrough, so behavior is unchanged when no plugin is installed.

- `Trading.OrderEntry.AdvancedSelect`: add a custom entry to the order-type Advanced dropdown. A value that isn't a real OrderType is routed via `onExtraSelect`/`selectedExtraId` instead of `order_type`.
- `Trading.OrderEntry.Body`: replace the order-entry form body with a custom panel while the type selector stays in place.
- `Trading.OrderEntry.BuySellSwitch`: new `selectedCustomTypeId` prop lets a plugin hide the Buy/Sell switch for its own type only.
- `Trading.OrderEntry.MobileTypeSelect`: add a custom entry to the mobile order-type dropdown (same routing model as `AdvancedSelect`; preserves the `marketOrderDisabled` modal).
- `Trading.Chart.Overlay`: render over the chart once the TradingView widget is ready (receives the live widget and current symbol).
- `Trading.DataList.Desktop.Tabs`: add custom tabs to the desktop data-list strip.
- `Trading.DataList.Mobile.Tabs`: add custom tabs to the mobile data-list strip.
- `Trading.Layout.Mobile`: mobile counterpart to `Trading.Layout.Desktop`. Lets a plugin mount a context provider (e.g. a grid-bot or basis-trade provider) above the mobile trading layout, so feature UI rendered by other interceptors (`OrderEntry.MobileTypeSelect`, `OrderEntry.Body`, `DataList.Mobile.Tabs`, `Chart.Overlay`) can read that context.
