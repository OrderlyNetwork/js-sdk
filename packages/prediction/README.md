# Prediction integration

Account data, the trading form, and the display lists each manage their own resources. For account-only display, use `usePredictionAccountData`; this hook does not initialize order placement, one-tap trading, or order book logic.

```tsx
import {
  SharedProductDataPanel,
  usePredictionAccountData,
  usePredictionMarkets,
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

The page reads the existing all-symbol and notional precision preferences and keeps list and count scopes in sync. Prediction selection uses the SDK app provider's existing `onRouteChange` callback with `{ href: "/prediction/" + encodeURIComponent(symbol), name: "prediction" }`. The host handles language prefixes and its own router. Configure the standard `/prediction/:symbol` route. Without `onRouteChange`, the automatic Prediction market dropdown is omitted; account panel extensions remain available.

`TradingPageProps.predictionEnabled` defaults to `true`. Set it to `false` to disable this consumer's automatic Prediction resources and restore native Perps panels. It can be toggled at runtime. Explicit `marketsDropdown` and `dataListProductContent` objects independently replace the corresponding automatic configuration as a whole, without merging nested slots. Explicit configurations remain in effect when automatic Prediction is disabled.

Same-product selection calls `onSymbolChange` when supplied; the host owns updating `symbol` and its URL. Without this callback, selection requests `/perp/:symbol` through `onRouteChange`. Cross-product selection only calls `onRouteChange`. Selecting the current symbol is a no-op. Custom route mappings belong in the host's `onRouteChange` adapter.

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

Automatic resources follow the slots in use. A non-nullish `marketsDropdown` (including `{}`), or navigation being unavailable (no `onRouteChange`), disables the automatic dropdown's metadata query and round clock. A non-nullish `dataListProductContent` (including `{}`) disables automatic account resources and counts. Removing an override resumes that part of the extension. Account panels retain their own market metadata when the dropdown is disabled; other consumers' shared resources and the native Perps account caches remain available.

Existing account and SWR providers and SDK stylesheet setup are still required. The UI and Prediction stylesheet builds include the shared components. Shared Perps components, trading preferences, and contracts now live in `@orderly.network/trading-common`; their original Trading exports remain available. The shared package is installed as an SDK dependency and does not require consumer setup.

### Advanced integration and custom slots

For manual control of resources or custom slot composition, keep using `usePredictionTradingExtension` and disable the page's automatic integration:

`usePredictionTradingExtension` provides the markets dropdown and the desktop and mobile account panel extensions in one call. The integrator keeps control of routing, URL parameters, chart configuration, and the current symbol:

```tsx
import { usePredictionTradingExtension } from "@orderly.network/prediction";
import { TradingPage, useTradingLocalStorage } from "@orderly.network/trading";

function PerpPage({
  symbol,
  onSymbolChange,
  tradingViewConfig,
  sharePnLConfig,
  navigate,
}) {
  const { showAllSymbol, pnlNotionalDecimalPrecision } =
    useTradingLocalStorage();
  const predictionExtension = usePredictionTradingExtension({
    symbol,
    showAllSymbol,
    onPredictionSelect: (symbol) =>
      navigate(`/prediction/${encodeURIComponent(symbol)}`),
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
  });

  return (
    <TradingPage
      {...predictionExtension}
      predictionEnabled={false}
      symbol={symbol}
      onSymbolChange={onSymbolChange}
      tradingViewConfig={tradingViewConfig}
      sharePnLConfig={sharePnLConfig}
    />
  );
}
```

`showAllSymbol` must stay in sync with the trading page preference. When enabled, all symbols are shown; when disabled, the Perps list is filtered by the current `symbol`, and the Prediction list is filtered by the underlying market of that symbol. Count statistics use the same scope as the panels. The positions panel wraps the trading page's native content and preserves its original interactions, with Perps as the default product selection.

Pass the host page's `onSymbolChange`, `sharePnLConfig`, and `pnlNotionalDecimalPrecision` to the adapter as well, so the Perps order and history panels reuse the same navigation callback, share configuration, and notional precision. All three parameters are optional; standalone shared panels also accept them, and the public type is `PredictionPerpsPanelProps`.

Count statistics read the positions store directly and do not initialize TP/SL queries. Order statistics consumers release their cache registration when disabled, when the scope changes, or on unmount; other consumers of the same query remain valid.

`enabled` defaults to `true`. Setting it to `false` returns an empty extension configuration and disables Prediction queries for that consumer, restoring the trading page's native panels; shared resources already held by other consumers are unaffected. Logged-out or loading states keep the existing account panel behavior, and counts are `null` while the open-order snapshot is not yet complete. The adapter does not fetch the full order or settlement history up front; the history panel loads on demand when displayed.

`marketsEnabled` and `accountPanelsEnabled` both default to `true` and independently control the returned slots and their resources. The master `enabled: false` overrides both. For example, retain Prediction account panels while supplying your own dropdown:

```tsx
const accountExtension = usePredictionTradingExtension({
  symbol,
  showAllSymbol,
  onPredictionSelect,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
  marketsEnabled: false,
  accountPanelsEnabled: true,
});

<TradingPage
  {...accountExtension}
  predictionEnabled={false}
  marketsDropdown={customMarketsDropdown}
  symbol={symbol}
  tradingViewConfig={tradingViewConfig}
/>;
```

With only `marketsEnabled: true`, the extension returns the dropdown without starting account queries, counts, or settlement polling. With both flags off, it returns `{}`. Hook order stays stable when flags change, and each consumer releases its demand when disabled or unmounted.

When customizing a single slot, merge the corresponding level explicitly and keep the rest of the extension:

```tsx
const customExtension = {
  ...predictionExtension,
  dataListProductContent: {
    ...predictionExtension.dataListProductContent,
    pending: <CustomPendingPanel />,
    mobile: {
      ...predictionExtension.dataListProductContent?.mobile,
      pending: <CustomMobilePendingPanel />,
    },
  },
};

<TradingPage
  {...customExtension}
  predictionEnabled={false}
  symbol={symbol}
  tradingViewConfig={config}
/>;
```

This customization applies when the adapter is enabled; when disabled, use the original `predictionExtension` directly to avoid injecting custom panels. For standalone layouts or asset page integration, the public account hook and panel components remain available.

The public types are `PredictionTradingExtensionOptions` and `PredictionTradingExtensionProps`; the return value maps to the `marketsDropdown` and `dataListProductContent` props of `TradingPageProps`. The existing `usePredictionMarketsDropdown(callback)` stays compatible and also accepts a second argument `{ enabled: false }` to control the markets query.

The independent contracts `TradingMarketsDropdownProps`, `TradingPerpsPanelProps`, `TradingDataListProductContent`, and `TradingPageExtensionProps` are exported by both `@orderly.network/trading-common` and `@orderly.network/trading`. Prediction's existing panel and extension type names reuse these contracts without depending on the full trading page type. Panel precision remains a panel option, not a new `TradingPage` prop.

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

The base account records the positions it has observed. When a position expires or disappears from the live list, tracking continues until the personal settlement history confirms completion. While settlements are pending, it refreshes every 5 seconds; during history display with no pending positions, every 60 seconds. There is no polling without load demand, and the timer is released once the last consumer unmounts. Multiple consumers share the same per-account registry and query cache.

Confirmed records for the same account are kept in the provider's account cache to determine settlement status on remount; after account switching, logout, or disabling, stale account data is not served to consumers, and late responses are isolated by account identity.

## Public data semantics

- `PredictionAccountActions` defines account operations independently; order edit parameters are the UP-coordinate price and the order's total quantity, including the filled quantity. Fee estimation likewise takes an UP-coordinate price.
- `estimateFee` returns `undefined` when the fee configuration is missing. The UI should display an unknown value and must not treat it as a zero fee.
- `pendingOrdersComplete` provides the completeness status for funding and cancellation protection; an open-order set that has not finished loading must not be used as a complete snapshot.
- Order `timestamp`, settlement `settledAt`, and market `now` are in milliseconds; `round` on positions and orders is in seconds. Order history preserves the `rejected` terminal state.
- `usePredictionMarkets` returns `PredictionMarketsState`; `configBySymbol` keeps its original name, and market configs use `API.BinaryInfoRow`.
- `PredictionHoldingsMarketView` only uses the stable market row interface; extra fields from the detail endpoint are not part of the holdings view contract.

A runnable type-consumption check against the package root entry lives in `apps/storybook/type-tests/predictionPublicApi.ts`; load and polling comparisons are documented in the [refactor validation record](./docs/refactor-validation.md).
