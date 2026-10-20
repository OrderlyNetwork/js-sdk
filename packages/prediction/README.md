# Prediction integration

Start with the [Prediction Quick Start](docs/quick-start.md) for a complete
integration using an existing application, including dependencies, providers, routes,
navigation, styles, and an acceptance checklist. The guide ships with the package
at `node_modules/@orderly.network/prediction/docs/quick-start.md`. The sections
below describe advanced integration and data contracts; custom order consumers
should read [Order field mapping](#order-field-mapping).

Account data, the trading form, and the display lists each manage their own resources. For account-only display, use `usePredictionAccountData`; this hook does not initialize order placement, one-tap trading, or order book logic.

```tsx
import {
  SharedProductDataPanel,
  usePredictionAccountData,
  type PredictionAccountState,
  type UsePredictionAccountDataOptions,
} from "@orderly.network/prediction";

const options: UsePredictionAccountDataOptions = { enabled: true };

function AccountPositions() {
  const account: PredictionAccountState = usePredictionAccountData(options);
  return (
    <SharedProductDataPanel
      state={account}
      type="positions"
      initialProduct="prediction"
    />
  );
}
```

The host environment still needs the SDK's account and SWR providers configured. All public types are imported from the package root entry; there is no need to reference internal trading hooks or source paths.

## Application features

Prediction is enabled by default. Disable its built-in pages and integrations across the application through the existing app provider:

```tsx
import {
  OrderlyAppProvider,
  useFeatureEnabled,
} from "@orderly.network/react-app";
import type { AppFeatures } from "@orderly.network/types";

const features: AppFeatures = { prediction: false };

function PredictionNavigation() {
  const predictionEnabled = useFeatureEnabled("prediction");
  return predictionEnabled ? <PredictionMenu /> : null;
}

export function ExampleApp() {
  return (
    <OrderlyAppProvider
      {...appConfig}
      features={features}
      onRouteChange={onRouteChange}
    >
      <PredictionNavigation />
      <App />
    </OrderlyAppProvider>
  );
}
```

Omitting `features`, passing `{}`, or setting `prediction: true` enables Prediction. Only explicit `false` disables it. Changes apply at runtime to Trading, Trading Next, Markets, Portfolio Orders and Positions, and the public Prediction market extensions. A local extension's `enabled: true` cannot override the application setting. Page-level `predictionEnabled` props have been removed; use the provider configuration instead. Existing trading-page `disableFeatures` props retain their original behavior.

When disabled, `PredictionPage` and `PredictionWidget` return `null` without mounting their business resources or requesting default-round navigation. Hosts own menu visibility and route fallback. Each automatic integration releases its query, subscription and polling demand; independent consumers remain active. Account valuation is independent of this UI setting: the SDK automatically loads Binary symbol metadata while the current account has Binary positions or pending order quantities, and stops its account-level polling when that exposure disappears. No additional provider configuration is required. Low-level data hooks remain available. The setting is not an authorization or security boundary.

## Perps trading page integration

`TradingPage` automatically adds Prediction markets and desktop and mobile account panels. Existing Perps pages keep using the same component and props:

```tsx
import { TradingPage } from "@orderly.network/trading";

<TradingPage
  symbol={symbol}
  onSymbolChange={onSymbolChange}
  tradingViewConfig={tradingViewConfig}
  sharePnLConfig={sharePnLConfig}
/>;
```

Upgrading alone is not a zero-action change: Prediction is enabled by default, and hosts that already pass `onRouteChange` (most do, for portfolio and footer links) show Prediction entries in the markets dropdown immediately. Selecting one navigates to `/prediction/:symbol`; until that route exists the host serves a 404. Either configure the route as described below or set `features={{ prediction: false }}` on `OrderlyAppProvider` to keep Prediction off.

The page reads the existing all-symbol and notional precision preferences and keeps list and count scopes in sync. Prediction selection uses the SDK app provider's existing `onRouteChange` callback with `predictionRoute(symbol)`, i.e. `{ href: "/prediction/" + encodeURIComponent(symbol), name: "prediction" }`. The host handles language prefixes and its own router. Configure the standard `/prediction/:symbol` route. Without `onRouteChange`, the automatic Prediction market dropdown is omitted; account panel extensions remain available.

The application feature setting controls automatic Prediction integration. Trading pages and their providers assemble the market surfaces and account panels internally; hosts do not supply product-content overrides.

Same-product selection calls `onSymbolChange` when supplied; the host owns updating `symbol` and its URL. Without this callback, selection requests `/perp/:symbol` through `onRouteChange`. Cross-product selection only calls `onRouteChange`. Selecting the current symbol is a no-op. Custom route mappings belong in the host's `onRouteChange` adapter.

### Route builders

Every SDK page builds these destinations with the helpers exported from `@orderly.network/types`; hosts can use the same helpers for their own links and match on `RouteOption.name` instead of parsing hrefs:

```tsx
import {
  PERP_ROUTE_NAME,
  PREDICTION_ROUTE_NAME,
  perpRoute,
  predictionRoute,
} from "@orderly.network/types";

PERP_ROUTE_NAME; // "perps"
PREDICTION_ROUTE_NAME; // "prediction"
perpRoute("PERP_BTC_USDC"); // { href: "/perp/PERP_BTC_USDC", name: "perps" }
predictionRoute(); // { href: "/prediction", name: "prediction" }
predictionRoute("PERP_BTC5M2608271200_USDC", { replace: true });
```

Symbols are URI-encoded. `replace` is only present when requested.

### Trade sub menu

Hosts with a Perps / Prediction switcher in the main navigation can use `TradeSubMenuWidget` from `@orderly.network/markets` instead of maintaining their own copy. It navigates with the builders above, hides Prediction when `features.prediction` is `false`, and accepts extra entries. Hosts control the highlighted entry with `activeKey` derived from their route; when omitted, it defaults to `"perps"`. Pass the current Perps page `symbol` to target that market; without one, the widget uses the remembered Perps symbol and then `defaultSymbol` (`PERP_ETH_USDC`). `items` receives the built-in entries and returns the final list, and `onSymbolChange` overrides navigation for markets picked in the panel.

## Prediction page navigation

```tsx
import {
  PredictionPage,
  type PredictionSymbolSelection,
} from "@orderly.network/prediction";

// Read the exact contract symbol from /prediction/:symbol.
<PredictionPage symbol={symbol} />;

// Optional controlled integration: the host accepts the selection by updating symbol.
<PredictionPage
  symbol={symbol}
  onSymbolChange={({ symbol }: PredictionSymbolSelection) => setSymbol(symbol)}
/>;
```

`onSymbolChange` receives `{ symbol }`, for example `{ symbol: "PERP_BTC5M2608271200_USDC" }`. It takes precedence over same-product navigation. Without it, selection requests `/prediction/:symbol`. Market dropdowns select their current round, while chart selection, next-round, and live-round controls request an exact target contract. Selecting the current contract is a no-op. Choosing a Perp market only calls `onRouteChange` with `/perp/:symbol`.

The URL identifies a specific round: refresh, sharing, and browser history restore that round. Expiry and metadata updates do not advance it automatically. The live-round control selects the current round at click time and remains pinned to that contract. Round selection only reports a request; the host must update `symbol` before state changes. Accepted same-market round changes clear amount, percentage, and limit price; market changes reset the form. Ignored or delayed requests preserve the existing contract, form, and storage.

The page first resolves the symbol from the Binary snapshot, then requests `/v1/public/binary/info/:symbol` when it is absent. Invalid symbols, mismatched metadata, and unavailable details retain the unavailable view without redirecting. Contracts loaded only from historical details cannot trade. Previously accepted rows remain visible after leaving the snapshot, and settlement details continue refreshing.

In routed mode, entering `/prediction` selects the current round of the remembered/default market and fills the URL with `replace: true`. Hosts should forward `RouteOption.replace` to their router. Controlled mode does not fill the URL. The widget pins the initial default contract even while the host delays accepting the URL. Cross-product dropdown entries are hidden without a router; market and round selection require a callback or router. Without either, the default contract remains available for display and eligible trading, but selection is disabled and expiry does not advance the round. Language prefixes and query parameters remain host responsibilities. Market family IDs remain internal grouping and preference values; they are no longer page props or URL parameters.

### Automatic integration resources

With Prediction enabled, Trading shares account data and counts across its desktop and mobile panels. Market selectors load Prediction metadata when `onRouteChange` is available; without navigation, the market additions are omitted while account panels remain available. Trading Next adds the three market selectors without adding cross-product account panels.

Disabling `features.prediction` releases feature-owned queries, clocks and settlement polling for these page consumers and restores native Perps content. Other independent consumers and account valuation retain their own resources. The history panels load on demand rather than fetching all orders and settlements up front. Counts remain `null` until the open-order snapshot is complete.

The all-symbol preference controls list and count scopes together. Host navigation callbacks, PnL sharing configuration and notional precision continue to apply to embedded Perps panels.

### Removed manual page integration API

The page/provider inputs `marketsDropdown`, `marketsSheet`, `sideMarkets` and `dataListProductContent` have been removed. `usePredictionTradingExtension`, its options/result types, and the Trading/Trading Shared slot-specific aliases are no longer public APIs. Remove manual extension calls and their spread/override props; configure `features.prediction` on `OrderlyAppProvider` and render the standard page instead:

```tsx
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { TradingPage } from "@orderly.network/trading";

<OrderlyAppProvider
  brokerId={brokerId}
  networkId={networkId}
  onRouteChange={onRouteChange}
  features={{ prediction: true }}
>
  <TradingPage symbol={symbol} tradingViewConfig={tradingViewConfig} />
</OrderlyAppProvider>;
```

Independent account hooks and panel components remain available for standalone layouts. `TradingPerpsPanelProps` and `PredictionPerpsPanelProps` remain public. Existing market-component extension APIs and Interceptor targets are unchanged; this change introduces no new customization targets.

Existing account and SWR providers are still required; see [Stylesheet](#stylesheet) for stylesheet options. Shared Perps components and preferences remain in `@orderly.network/trading-shared`, with the original Trading exports preserved.

## Host symbol persistence

The SDK does not touch host routing state, but hosts that remember the last perp symbol (the common `localStorage` pattern behind symbol-less `/perp` redirects) should use the guarded helpers shipped in `@orderly.network/utils` instead of hand-rolling storage. `@orderly.network/trading` continues to re-export `PERP_SYMBOL_STORAGE_KEY`, `getStoredPerpSymbol`, and `setStoredPerpSymbol`, so existing Trading imports remain supported. Imports from `@orderly.network/trading-shared` must move to `@orderly.network/utils`.

```tsx
import {
  getStoredPerpSymbol,
  setStoredPerpSymbol,
} from "@orderly.network/utils";

const FALLBACK = "PERP_ETH_USDC";

export function getPerpSymbol() {
  return getStoredPerpSymbol() ?? FALLBACK;
}

export function setPerpSymbol(symbol: string) {
  setStoredPerpSymbol(symbol);
}
```

The helpers own the storage key (`orderly_perp_symbol`) and the guard. They are safe to call during SSR or when the browser blocks storage: reads return `null` and writes are skipped. A Prediction round symbol such as `PERP_BTC5M2608271200_USDC` is never written and never returned; a round found in storage (for example written by a host implementation that predates the guard) is removed on read, so the store self-heals. Without the guard a remembered round expires and hijacks every later symbol-less `/perp` redirect onto a dead market — and upgrading the package alone cannot repair storage written by unguarded host code.

Hosts that mirror the current symbol across pages (for example, a header bound to the active route) should still route-gate what they mirror, so Prediction views never feed a round symbol into perps display state.

## Stylesheet

Existing stylesheet setup is enough: `@orderly.network/ui/dist/styles.css`, which hosts already import, is built from the whole workspace and already contains the Prediction and shared `@orderly.network/trading-shared` styles:

```css
/* the existing import already covers Prediction; do not add a prediction line */
@import "@orderly.network/ui/dist/styles.css";
```

Keep the UI and Prediction packages on the same release line; an older UI stylesheet paired with a newer Prediction package can miss newer classes. The package also ships its own prebuilt `dist/styles.css` for hosts that consume Prediction without the UI stylesheet. Hosts running their own Tailwind build with the SDK preset can skip both imports and point their `content` globs at the SDK packages instead; the class strings are present in the published JavaScript.

## Load options

| Option                     | Default | Behavior                                                                                                  |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `enabled`                  | `true`  | Controls this consumer's account query and settlement polling; when off, no legacy account data is served |
| `includeOrderHistory`      | `false` | Loads order history for the account projection; paginated display lists manage their own queries          |
| `includeSettlementHistory` | `false` | Requests settlement history for display; automatic tracking of pending settlements ignores this default   |

The legacy `includeHistory` option has been removed. To load both kinds of history, configure them explicitly:

```tsx
const account = usePredictionAccountData({
  enabled: true,
  includeOrderHistory: true,
  includeSettlementHistory: true,
});
```

The base account always keeps balances, positions, and the full open-order snapshot. Open orders auto-paginate to completeness and back funding estimates, sellable quantity, and cancellation; display orders load page by page as the user pages, and the two lists are never mixed. The shared orders panel enables or disables Perps / Prediction queries based on the product selection.

The settlement history widget loads history on its own after mounting and releases its demand when hidden or switched to another product. The prediction page round result display also requests settlement history. Custom history display components can access the same data via `includeSettlementHistory: true`.

## Settlement resource lifecycle

The base account records the positions it has observed. When a position expires or disappears from the live list, tracking continues until the personal settlement history confirms completion. While settlements are pending, it refreshes every 5 seconds; during history display with no pending positions, every 60 seconds. There is no polling without load demand, and the timer is released once the last consumer unmounts. Multiple consumers share the same per-account registry and query cache. Order cache registration is held per consumer: unmounting one consumer does not remove a key other consumers still need, and Prediction releases the registration after the last consumer leaves. Perps usage that never sets load options keeps the original cache-resident behavior.

Confirmed records for the same account are kept in the provider's account cache to determine settlement status on remount; after account switching, logout, or disabling, stale account data is not served to consumers, and late responses are isolated by account identity.

## Public data semantics

### Binary fees

Binary account fields `binary_maker_fee_rate` and `binary_taker_fee_rate` are
coefficients in bps. Divide by 10000 once to obtain `r` in
`fee = shares * r * up_execution_price * (1 - up_execution_price)`.
The current product default is maker 0 / taker 300 bps; always use the account's
actual configuration. Missing or invalid configuration is unavailable, not a
default fee or a free trade. A displayed coefficient of 3.00% does not mean a
flat 3% charge on the trade amount.

The shared account observer applies private `account` fee updates to Client Info
and refreshes that snapshot after a private WebSocket reconnect. Managed-account
views continue to use the target account's own fee configuration. Historical fees
remain the backend's actual per-fill facts and are never recomputed from current
rates or an average order price.

Binary maker and taker share a 300 bps coefficient cap, independent of PERP.
Builders obtain the confirmed Binary-only funding buffer from
`BINARY_ORDER_FROZEN_BUFFER`, exported by `@orderly.network/prediction`.
Required frozen, MAX and balance validation use this constant and the submitted
limit/protection price, with DOWN mapped to the complementary price. Pure closing
orders require no additional frozen funds. Estimated fees are shown separately
and are not added again to the buffer-inclusive required frozen amount.

Public results accept `UP/1`, `DOWN/0` and `TIE/0.5` under `binary-v1`.
From expiry the selected round is polled every 2 seconds plus 0–1 second of
jitter, backing off to 10 seconds after 30 seconds and stopping when a valid
official result is published, even if price evidence is unavailable. This is
independent of personal history polling. Complete expiry history confirms the
position segment's close and final net PnL; spendable funds follow account
balances, not the result timestamp or `settled_at` alone.

One-tap presets accept 5–99,999.99 USDC with at most two decimal places.
Oversized opening orders fill maximum-size children first and balance only an
undersized final pair; their tick-rounded residual stays unspent. Previews and
funding estimates use the actual submitted child quantities.

### Account projections

- `PredictionAccountActions` defines account operations independently; order edit parameters are the UP-coordinate price and the order's total quantity, including the filled quantity. Fee estimation likewise takes an UP-coordinate price.
- `estimateFee` returns `undefined` when the fee configuration is missing. The UI should display an unknown value and must not treat it as a zero fee.
- `pendingOrdersComplete` provides the completeness status for funding and cancellation protection; an open-order set that has not finished loading must not be used as a complete snapshot.
- `openOrders`, `history`, and `useBinaryOrderRows().rows` contain original `API.Order` records. Order `created_time`, settlement `settledAt`, and market `now` are in milliseconds. Position `round` and the value returned by `binaryOrderRound(order)` are in seconds; orders do not expose the former projected `timestamp` or `round` fields.
- Order history retains the raw API `status`, including `REJECTED`. `binaryOrderDisplayStatus(order)` maps it to the display value `rejected`. See [Order field mapping](#order-field-mapping) for all field and display-helper changes.
- `usePredictionMarkets` returns `PredictionMarketsState`; `configBySymbol` keeps its original name, and market configs use `API.BinaryInfoRow`.
- `PredictionHoldingsMarketView` only uses the stable market row interface; extra fields from the detail endpoint are not part of the holdings view contract.

### Order field mapping

Prediction account data, order queries, and components accept and return original
`API.Order` records. The former projected types `PredictionOpenOrder` and
`PredictionTrade` and the `toPredictionOrder()` helper have been removed without
aliases. Product filtering only filters records and keeps the original object
references and fields; UP/DOWN, side, price, and round are derived at consumption
time with helpers exported from the package root.

| Former projected field               | Use instead                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `id`                                 | `order_id`                                                                       |
| `timestamp`                          | `created_time` (milliseconds)                                                    |
| `filledQuantity`                     | `total_executed_quantity`                                                        |
| `averagePrice`                       | `average_executed_price` (UP coordinate)                                         |
| `totalFee` / `feeAsset`              | `total_fee` / `fee_asset`                                                        |
| `realizedPnl`                        | `realized_pnl`                                                                   |
| `reduceOnly`                         | `reduce_only`                                                                    |
| `clientOrderId` / `orderTag`         | `client_order_id` / `order_tag`                                                  |
| `orderType`                          | `type` (raw `LIMIT`, `IOC`, `SETTLEMENT`, ...)                                   |
| `type` (market/limit classification) | `binaryOrderDisplayType(order)`                                                  |
| `side` (lowercase)                   | raw `side` (`BUY` / `SELL`); buy/sell action via `binaryOrderDisplaySide(order)` |
| `status` (lowercase)                 | raw `status`; display category via `binaryOrderDisplayStatus(order)`             |
| `outcome`                            | `binaryOrderOutcome(order)`                                                      |
| `round`                              | `binaryOrderRound(order)` (seconds)                                              |

`binaryOrderDisplayPrice(order, price)` converts an UP-coordinate price to the
row's display direction. `toPredictionOrderStatus` / `toApiPredictionOrderStatus`
convert filter statuses between the display and API vocabularies.

```ts
import {
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderOutcome,
} from "@orderly.network/prediction";
import type { API } from "@orderly.network/types";

declare const order: API.Order;

const outcome = binaryOrderOutcome(order);
const displaySide = binaryOrderDisplaySide(order);
const displayPrice =
  order.price != null && Number.isFinite(order.price)
    ? binaryOrderDisplayPrice(order, order.price)
    : undefined;
const pnl = order.realized_pnl;
```

Preserved behavior for custom consumers:

- Raw prices are always in the UP coordinate; only DOWN display and edit-input bounds use the complementary price, and the API record is never overwritten.
- Order edits keep the original side, type, reduce-only flag, and client metadata.
- Filled includes terminal orders with executions, including IOC orders cancelled after a partial fill; it excludes still-open partially filled orders and zero-execution terminal orders.
- Order realized PnL uses `realized_pnl` directly, with no extra fee deduction and no sign change by outcome. Missing or non-finite PnL, average price, and fee values are handled at the display boundary without modifying the record.

A runnable type-consumption check against the package root entry lives in `apps/storybook/type-tests/predictionPublicApi.ts`.
