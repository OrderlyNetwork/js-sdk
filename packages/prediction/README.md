# @orderly.network/prediction

Prediction (Binary round) markets for Orderly SDK applications: a Prediction
trading page, plus Prediction entries in the Perps trading page, Markets, and
Portfolio Orders and Positions.

```sh
npm install @orderly.network/prediction
```

Start with the [Prediction Integration Guide](docs/integration-guide.md). It
covers adding Prediction to an existing application: dependencies, providers,
routes, navigation, styles, an acceptance checklist, and
[Next.js, Remix, and Vite reference projects](docs/integration-guide.md#reference-projects).
The guide ships with the package at
`node_modules/@orderly.network/prediction/docs/integration-guide.md`.

This README is the reference for feature behavior, navigation contracts, and
data semantics. Custom order consumers should read
[Order field mapping](#order-field-mapping); upgrading hosts should also check
[Migrating from earlier versions](#migrating-from-earlier-versions).

> [!IMPORTANT]
> **Upgrading requires a route.** Prediction is enabled by default. Hosts that
> already pass `onRouteChange` to `OrderlyAppProvider` (most do, for Portfolio
> and footer links) show Prediction entries in the trading page's markets
> dropdown immediately after upgrading. Selecting one navigates to
> `/prediction/:symbol`, which returns a 404 until the host registers that
> route. Either
> [add the route](docs/integration-guide.md#2-connect-the-provider-routes-page-and-menu)
> or set `features={{ prediction: false }}` on `OrderlyAppProvider`.

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

- Omitting `features`, passing `{}`, or setting `prediction: true` enables
  Prediction. Only an explicit `false` disables it.
- The setting applies at runtime to Trading, Trading Next, Markets, Portfolio
  Orders and Positions, and the public Prediction market extensions. A local
  extension's `enabled: true` cannot override it. Existing trading-page
  `disableFeatures` props keep their original behavior.
- Call `useFeatureEnabled` in descendants of `OrderlyAppProvider`, including
  custom navigation components that read this setting.

When Prediction is disabled:

- `PredictionPage` and `PredictionWidget` return `null` without mounting their
  business resources or requesting default-round navigation. Hosts own menu
  visibility and the route fallback.
- Each automatic integration releases its query, subscription, and polling
  demand. Independent consumers and low-level data hooks remain available.
- Account valuation is unaffected. While the current account has Binary
  positions or pending order quantities, the SDK loads Binary symbol metadata
  automatically, and stops this account-level polling when that exposure
  disappears. No additional provider configuration is required.
- The setting is not an authorization or security boundary.

## Perps trading page integration

`TradingPage` automatically adds Prediction markets and desktop and mobile account panels. Existing Perps pages keep using the same component and props:

```tsx
import { TradingPage } from "@orderly.network/trading";

<TradingPage
  symbol={symbol}
  tradingViewConfig={tradingViewConfig}
  sharePnLConfig={sharePnLConfig}
/>;
```

Prediction selection calls the app provider's `onRouteChange` with
`predictionRoute(symbol)`, i.e.
`{ href: "/prediction/" + encodeURIComponent(symbol), name: "prediction" }`.
Register the standard `/prediction/:symbol` route; the host's `onRouteChange`
adapter owns language prefixes, its router, and any custom route mappings.
Without `onRouteChange`, the Prediction market additions are omitted, while the
account panels remain available.

Market selection on the trading page:

- Same-product selection calls `onSymbolChange` when supplied; the host owns
  updating `symbol` and its URL. Without this callback, selection requests
  `/perp/:symbol` through `onRouteChange`.
- Cross-product selection only calls `onRouteChange`.
- Selecting the current symbol is a no-op.

The page reads the existing all-symbol and notional precision preferences and
keeps list and count scopes in sync. Trading pages and their providers assemble
the market surfaces and account panels internally; hosts do not supply
product-content overrides.

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

Hosts with a Perps / Prediction switcher in the main navigation can use
`TradeSubMenuWidget` from `@orderly.network/markets` instead of maintaining
their own copy. It navigates with the builders above, hides Prediction when
`features.prediction` is `false`, and accepts extra entries.

| Prop             | Behavior                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `activeKey`      | Highlighted entry, derived from the host route. Defaults to `"perps"`.                               |
| `symbol`         | Current Perps page symbol. Without one, the widget uses the remembered Perps symbol.                 |
| `defaultSymbol`  | Perps symbol used when neither `symbol` nor a remembered symbol exists. Defaults to `PERP_ETH_USDC`. |
| `items`          | Receives the built-in entries and returns the final list.                                            |
| `onSymbolChange` | Overrides navigation for markets picked in the panel.                                                |

Pass only a Perps route's symbol as `symbol`; a Prediction round contract is not
a Perps destination. For server-rendered hosts, keep the initial server/client
markup consistent when reading browser preferences. See the
[Trade menu example](docs/integration-guide.md#trade-menu).

## Portfolio integration

Continue using `OrdersModule.OrdersPage` and `PositionsModule.PositionsPage`
from `@orderly.network/portfolio`. When their optional `onSymbolChange` and
`onPredictionSelect` callbacks are omitted, both pages use the app provider's
`onRouteChange` for Perps and Prediction selection. Keep callbacks that
implement additional host behavior; wrappers that only navigate can delegate to
the SDK.

Pass the host's existing `sharePnLConfig` to both pages, and preserve Positions'
precision and calculation-mode props. The standard pages need no manual
Prediction account hook or product panel.

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

`onSymbolChange` receives `{ symbol }`, for example
`{ symbol: "PERP_BTC5M2608271200_USDC" }`, and takes precedence over
same-product navigation. Without it, the page runs in routed mode and selection
requests `/prediction/:symbol` through `onRouteChange`. Market dropdowns select
their market's current round, while chart selection and the next-round and
live-round controls request an exact contract. Selecting the current contract
is a no-op. Choosing a Perps market only calls `onRouteChange` with
`/perp/:symbol`.

### Exact round URLs

- The URL identifies one round contract: refresh, sharing, and browser history
  restore that round. Expiry and metadata updates do not advance it
  automatically.
- The live-round control selects the current round at click time and then stays
  pinned to that contract.
- Selection only requests a change; the page switches after the host updates
  `symbol`. Ignored or delayed requests keep the existing contract, form, and
  storage.
- An accepted round change within the same market clears amount, percentage,
  and limit price; a market change resets the form.

### Symbol resolution and fallback

- The page resolves the symbol from the Binary snapshot first, then requests
  `/v1/public/binary/info/:symbol` when it is absent.
- Invalid symbols or mismatched detail metadata do not themselves request a
  redirect.
- When a valid requested contract has no usable data, its detail request fails,
  and a fallback round exists in the same market, the SDK requests that round
  once for the current selection: routed mode uses `replace: true`, and
  controlled mode calls `onSymbolChange`. The host still owns accepting the
  selection. Without a fallback round, the unavailable view remains.
- A failed refresh of already-available round data does not trigger fallback.
- Contracts loaded only from historical details cannot trade. Previously
  accepted rows remain visible after leaving the snapshot, and their settlement
  details continue refreshing.

### Base route and missing navigation

- In routed mode, entering `/prediction` selects the current round of the
  remembered or default market and fills the URL with `replace: true`. Forward
  `RouteOption.replace` to the host router. The page keeps this initial default
  contract even while the host delays accepting the URL.
- Controlled mode does not fill the URL.
- Without `onRouteChange`, cross-product dropdown entries are hidden. Without
  both `onSymbolChange` and `onRouteChange`, the default contract remains
  available for display and eligible trading, but market and round selection is
  disabled and expiry does not advance the round.
- Language prefixes and query parameters remain host responsibilities.

### Automatic integration resources

With Prediction enabled, Trading shares account data and counts across its
desktop and mobile panels, and its market selectors load Prediction metadata
only when `onRouteChange` is available. Trading Next adds the three market
selectors without cross-product account panels.

Disabling `features.prediction` releases feature-owned queries, clocks, and
settlement polling for these page consumers and restores native Perps content.
Other independent consumers and account valuation keep their own resources.

The history panels load on demand rather than fetching all orders and
settlements up front. Counts remain `null` until the open-order snapshot is
complete. The all-symbol preference controls list and count scopes together.
Host navigation callbacks, PnL sharing configuration, and notional precision
continue to apply to embedded Perps panels.

## Host symbol persistence

The SDK does not touch host routing state. Hosts that remember the last Perps
symbol (the common `localStorage` pattern behind symbol-less `/perp` redirects)
should use the guarded helpers from `@orderly.network/utils` instead of
hand-rolling storage. `@orderly.network/trading` also re-exports
`PERP_SYMBOL_STORAGE_KEY`, `getStoredPerpSymbol`, and `setStoredPerpSymbol`.

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

The helpers own the storage key (`orderly_perp_symbol`) and the guard:

- They are safe to call during SSR or when the browser blocks storage: reads
  return `null` and writes are skipped.
- A Prediction round symbol such as `PERP_BTC5M2608271200_USDC` is never written
  or returned. A round found in storage (for example, written by older unguarded
  host code) is removed on read, so the store repairs itself.

Without the guard, a remembered round expires and redirects every later
symbol-less `/perp` visit to a dead market. Upgrading the package alone cannot
repair storage written by unguarded host code.

For existing applications with a host-owned storage key, migrating that
preference is a host responsibility. Preserve valid SDK values and migrate
legacy Perps values through the guarded setter. See
[guarded storage and migration](docs/integration-guide.md#guarded-storage-and-migration).

Hosts that mirror the current symbol across pages (for example, a header bound
to the active route) should still route-gate what they mirror, so Prediction
views never feed a round symbol into Perps display state.

## Stylesheet

The existing stylesheet setup is enough. `@orderly.network/ui/dist/styles.css`,
which hosts already import, includes the styles of all SDK packages, including
Prediction and `@orderly.network/trading-shared`:

```css
/* the existing import already covers Prediction; do not add a prediction line */
@import "@orderly.network/ui/dist/styles.css";
```

Keep the UI and Prediction packages on the same release line; an older UI
stylesheet paired with a newer Prediction package can miss newer classes.

Alternatives:

- Hosts that consume Prediction without the UI stylesheet can import the
  package's own prebuilt `@orderly.network/prediction/dist/styles.css`.
- Hosts running their own Tailwind build with the SDK preset can skip both
  imports and point their `content` globs at the SDK packages; the class strings
  are present in the published JavaScript.

## Standalone account data

Account data, the trading form, and the display lists each manage their own
resources. For account-only layouts, use `usePredictionAccountData`; it does not
initialize order placement, one-tap trading, or order book logic.

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

Render it beneath the existing `OrderlyAppProvider`, which supplies the account
and SWR providers. Import all public types from the package root; internal
trading hooks and source paths are not part of the public API.

### Load options

| Option                     | Default | Behavior                                                                                                                    |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                  | `true`  | Controls this consumer's account query and settlement polling. When `false`, no previously loaded account data is returned. |
| `includeOrderHistory`      | `false` | Loads order history for the account projection; paginated display lists manage their own queries.                           |
| `includeSettlementHistory` | `false` | Requests settlement history for display; automatic tracking of pending settlements ignores this option.                     |

Regardless of these options, the hook always loads balances, positions, and the
full open-order snapshot. Open orders paginate automatically until complete and
back funding estimates, sellable quantity, and cancellation. Display orders load
page by page as the user pages, and the two lists are never mixed. The shared
orders panel enables or disables Perps / Prediction queries based on the
selected product.

The settlement history widget loads history after mounting and releases its
demand when hidden or switched to another product. The Prediction page's round
result display also requests settlement history. Custom history components can
load the same data with `includeSettlementHistory: true`.

### Settlement resource lifecycle

The account data tracks the positions it has observed. When a position expires
or leaves the live list, tracking continues until the personal settlement
history confirms completion.

- While settlements are pending, history refreshes every 5 seconds; while
  history is displayed with no pending positions, every 60 seconds.
- Nothing polls without load demand, and the timer is released when the last
  consumer unmounts.
- Multiple consumers share one per-account registry and query cache. Unmounting
  one consumer does not release resources another consumer still needs.
- Perps usage that never sets load options keeps its original cache behavior.

Confirmed records stay in the provider's account cache to determine settlement
status on remount. After account switching, logout, or disabling, stale account
data is not served, and late responses are isolated by account identity.

## Public data semantics

### Binary fees

Binary account fields `binary_maker_fee_rate` and `binary_taker_fee_rate` are
coefficients in bps. Divide by 10000 once to obtain `r` in
`fee = shares * r * up_execution_price * (1 - up_execution_price)`.

- The current product default is maker 0 / taker 300 bps; always use the
  account's actual configuration. Maker and taker share a 300 bps coefficient
  cap, independent of Perps.
- Missing or invalid configuration means the fee is unavailable, not a default
  fee or a free trade.
- A displayed coefficient of 3.00% does not mean a flat 3% charge on the trade
  amount.
- The shared account observer applies private `account` fee updates to Client
  Info and refreshes that snapshot after a private WebSocket reconnect.
  Managed-account views use the target account's own fee configuration.
- Historical fees are the backend's actual per-fill values and are never
  recomputed from current rates or an average order price.

### Order funding

Custom order forms obtain the Binary-only funding buffer from
`BINARY_ORDER_FROZEN_BUFFER`, exported by `@orderly.network/prediction`.
Required frozen funds, MAX, and balance validation use this constant with the
submitted limit or protection price, mapping DOWN to the complementary price.
Pure closing orders require no additional frozen funds. Estimated fees are shown
separately and are not added again to the buffer-inclusive required frozen
amount.

### Round results

A published result is valid only when the round's `outcome` and
`settlement_price_per_share` are `UP` / `1`, `DOWN` / `0`, or `TIE` / `0.5`.

From expiry, the selected round is polled every 2 seconds plus 0–1 second of
jitter, backing off to 10 seconds after 30 seconds. Polling stops when a valid
official result is published, even if price evidence is unavailable. This is
independent of personal history polling.

The complete expiry history confirms the position segment's close and final net
PnL. Spendable funds follow account balances, not the result timestamp or
`settled_at` alone.

### One-tap presets

One-tap presets accept 5–99,999.99 USDC with at most two decimal places.

Opening orders larger than the market's maximum order size are submitted as
several child orders of the maximum size. If the last child would fall below the
minimum size, the last two children are evened out to the tick; for opening
orders, an odd tick left by this balancing is not submitted. Previews and
funding estimates use the child quantities actually submitted.

### Account projections

- `PredictionAccountActions` defines account operations independently; order edit parameters are the UP-coordinate price and the order's total quantity, including the filled quantity. Fee estimation likewise takes an UP-coordinate price.
- `estimateFee` returns `undefined` when the fee configuration is missing. The UI should display an unknown value and must not treat it as a zero fee.
- `pendingOrdersComplete` provides the completeness status for funding and cancellation protection; an open-order set that has not finished loading must not be used as a complete snapshot.
- `openOrders`, `history`, and `useBinaryOrderRows().rows` contain original `API.Order` records. Order `created_time`, settlement `settledAt`, and market `now` are in milliseconds. Position `round` and the value returned by `binaryOrderRound(order)` are in seconds.
- Order history retains the raw API `status`, including `REJECTED`. `binaryOrderDisplayStatus(order)` maps it to the display value `rejected`. See [Order field mapping](#order-field-mapping) for all fields and display helpers.
- `usePredictionMarkets` returns `PredictionMarketsState`; `configBySymbol` maps symbols to market configs of type `API.BinaryInfoRow`.
- `PredictionHoldingsMarketView` only uses the stable market row interface; extra fields from the detail endpoint are not part of the holdings view contract.

### Order field mapping

Prediction account data, order queries, and components accept and return
original `API.Order` records. Product filtering only filters records and keeps
the original object references and fields. UP/DOWN, side, price, and round are
derived at consumption time with helpers exported from the package root.

The table maps the fields of the removed projected order types (see
[Migrating from earlier versions](#migrating-from-earlier-versions)) to the raw
fields and helpers:

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

Behavior custom consumers can rely on:

- Raw prices are always in the UP coordinate; only DOWN display and edit-input bounds use the complementary price, and the API record is never overwritten.
- Order edits keep the original side, type, reduce-only flag, and client metadata.
- Filled includes terminal orders with executions, including IOC orders cancelled after a partial fill; it excludes still-open partially filled orders and zero-execution terminal orders.
- Order realized PnL uses `realized_pnl` directly, with no extra fee deduction and no sign change by outcome. Missing or non-finite PnL, average price, and fee values are handled at the display boundary without modifying the record.

## Migrating from earlier versions

These changes affect hosts that integrated a pre-release Prediction build or the
earlier Trading and Trading Shared integration points.

### Removed manual page integration API

The page/provider inputs `marketsDropdown`, `marketsSheet`, `sideMarkets`, and
`dataListProductContent` have been removed. `usePredictionTradingExtension`, its
options/result types, and the Trading/Trading Shared slot-specific aliases are
no longer public APIs. Remove manual extension calls and their spread/override
props; configure `features.prediction` on `OrderlyAppProvider` and render the
standard page instead:

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

What remains unchanged:

- Independent account hooks and panel components remain available for
  standalone layouts. `TradingPerpsPanelProps` and `PredictionPerpsPanelProps`
  remain public.
- Existing market-component extension APIs and Interceptor targets are
  unchanged; this release introduces no new customization targets.
- Shared Perps components and preferences remain in
  `@orderly.network/trading-shared`, with the original Trading exports
  preserved.

### Other removed or moved APIs

| Change                                                                                      | Migration                                                                                                |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Page-level `predictionEnabled` props removed                                                | Configure `features.prediction` on `OrderlyAppProvider` ([Application features](#application-features)). |
| Market family IDs are no longer `PredictionPage` props or URL parameters                    | Pass the exact round `symbol`; family IDs remain internal grouping and preference values.                |
| Perps symbol storage helpers no longer exported from `@orderly.network/trading-shared`      | Import them from `@orderly.network/utils`; `@orderly.network/trading` re-exports are unchanged.          |
| `includeHistory` load option removed                                                        | Set `includeOrderHistory` and `includeSettlementHistory` explicitly (example below).                     |
| `PredictionOpenOrder`, `PredictionTrade`, and `toPredictionOrder()` removed without aliases | Consume raw `API.Order` records with the package helpers ([Order field mapping](#order-field-mapping)).  |
| Projected order `timestamp` and `round` fields removed                                      | Use `created_time` (milliseconds) and `binaryOrderRound(order)` (seconds).                               |

```tsx
const account = usePredictionAccountData({
  enabled: true,
  includeOrderHistory: true,
  includeSettlementHistory: true,
});
```
