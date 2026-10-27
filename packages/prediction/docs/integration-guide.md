# Prediction Integration Guide

Add Prediction to an existing Orderly SDK application: reuse its providers and
router, register a round-specific route, and let the SDK assemble the trading and
account panels.

For autonomous implementation, start with the
[AI Integration Workflow](#ai-integration-workflow) at the end of this guide, then
adapt the [Vite reference](#vite-reference) to the host using the
[framework differences](#framework-differences).

Prediction requires `@orderly.network/prediction` **3.3.0 or later**. Align the
host's Orderly SDK dependencies to the release that contains the chosen
Prediction version. Packages in one release do not all share a version number;
for example, `@orderly.network/perp` has its own major version. See
[Check dependencies and inputs](#b-check-dependencies-and-inputs) for how to pick
the release and its package versions. Use a pre-release only when explicitly
requested, with matching dependencies from that preview release.

> [!IMPORTANT]
> Prediction is enabled by default. After upgrading, a host that already passes
> `onRouteChange` immediately shows Prediction entries in the trading page's
> markets dropdown, and they lead to a 404 until the Prediction route exists.
> Complete [the route step](#2-connect-the-provider-routes-page-and-menu) in the
> same change, or set `features={{ prediction: false }}` on `OrderlyAppProvider`
> until it is ready.

## Minimal integration checklist

Use this checklist to locate the required changes before following the detailed
steps. Reuse the host's existing integration points:

- [ ] [Align dependencies](#1-prepare-dependencies-and-the-host-application) to the
      selected SDK release and add the packages imported by the integration.
- [ ] [Add the Prediction page](#vite-reference), passing the exact URL `symbol`
      to `PredictionPage` and keeping the host's existing layout.
- [ ] [Register the base and symbol routes](#framework-differences) with the
      existing router, locale prefix, and framework client boundary.
- [ ] [Wire provider navigation](#provider-navigation-wiring) through the host's
      shared callback, preserving locale, query, hash, and `replace`. Use the
      [guarded Perps storage helpers](#guarded-storage-and-migration) for remembered
      Perps destinations.
- [ ] [Extend the Trade menu](#trade-menu) and
      [handle disabled Prediction](#4-configure-feature-visibility-and-regional-restrictions)
      with hidden custom entries and a host route fallback.
- [ ] [Keep the shared styles](#3-keep-the-shared-styles-and-built-in-integrations)
      and standard Trading, Markets, and Portfolio integrations.

## Reference projects

Use these templates as complete examples of Prediction integration for each
framework:

| Framework | Project                                                                                            | Integration points to inspect                           |
| --------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Next.js   | [orderly-js-sdk-nextjs-template](https://github.com/OrderlyNetwork/orderly-js-sdk-nextjs-template) | App Router page/client view and locale middleware       |
| Remix     | [orderly-js-sdk-remix-template](https://github.com/OrderlyNetwork/orderly-js-sdk-remix-template)   | Optional-symbol route and server locale redirects       |
| Vite      | [orderly-js-sdk-vite-template](https://github.com/OrderlyNetwork/orderly-js-sdk-vite-template)     | Browser bootstrap, route factory, and lazy-loaded pages |

For shared wiring, inspect the provider, navigation adapter, Prediction route,
Trade menu, feature visibility, and Perps symbol storage. Adapt those pieces to
the host's existing structure and retain its broker/network, wallet, locale, and
layout configuration. File names, hook organization, menu contents, and test tools
are examples rather than SDK requirements.

Check the template's `package.json` and use a tag or commit compatible with the
SDK release selected for the host. A template tracking a preview release does
not establish compatibility with a stable release.

## 1. Prepare dependencies and the host application

Prediction requires React 18 or later. This guide and the reference projects
cover Next.js 15 App Router, Remix 2, and Vite with React Router 7; for other
framework versions or routers, adapt the same integration points. Keep the
host's existing framework: do not install React Router into Next.js or upgrade
Remix to React Router 7 for this integration. Use the host's existing package
manager and lockfile.

First align every Orderly SDK package already listed in the host's
`package.json` to that release, including its wallet connector, for example
`@orderly.network/trading` and `@orderly.network/ui-scaffold`. Then add
`@orderly.network/prediction` and only those of the following packages that the
integration code imports and the host does not yet depend on directly:

| Package                       | Imported by                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `@orderly.network/prediction` | Prediction route page                                                         |
| `@orderly.network/react-app`  | `useFeatureEnabled` in the route page                                         |
| `@orderly.network/types`      | `perpRoute`, `predictionRoute`, `RouteOption`                                 |
| `@orderly.network/utils`      | Guarded Perps symbol storage                                                  |
| `@orderly.network/i18n`       | `generatePath` and `getLocalePathFromPathname` in navigation                  |
| `@orderly.network/markets`    | `TradeSubMenuWidget`                                                          |
| `@orderly.network/ui`         | Global stylesheet and `PredictionIcon` for custom entries                     |
| `@orderly.network/hooks`      | `RestrictedInfoOptions`, only when configuring Prediction region restrictions |

For example, a host already on SDK 3.3.0 that depends on the other packages adds
only Prediction at the same release:

```sh
npm install --save-exact @orderly.network/prediction@3.3.0
# pnpm add --save-exact @orderly.network/prediction@3.3.0
# yarn add --exact @orderly.network/prediction@3.3.0
```

Use the line matching the host's package manager. This command does not install
or configure the host's wallet provider.

Keep these existing pieces:

- The configured router and the existing `LocaleProvider`, wallet connector, and
  `OrderlyAppProvider` composition. Any components using router hooks must
  remain under the host's router.
- The existing provider's `brokerId` / `brokerName` / `networkId` props **or** its
  stable `configStore`, with matching endpoints and wallet network. Keep that
  configuration form. Do not add a store just to match a generic example or
  combine the two exclusive provider configuration forms.

Coding, dependency checks, and public-market navigation checks do not require a
connected wallet or funds. Trading acceptance additionally requires a connected
wallet, a registered/signed-in Orderly account, and sufficient available collateral
on the selected test environment.

`OrderlyAppProvider` already composes the SDK configuration and account/data
providers. Add the routes to the existing provider tree; avoid creating a second
account provider or adding a Prediction-specific SWR provider.

## 2. Connect the provider, routes, page, and menu

### Framework differences

All code examples below use the paths and providers of a Vite application.
Adapt those integration points to the host; keep one router, provider tree, and
page layout. Framework-specific code should follow the existing project structure.

Framework route params are already decoded; decode only when extracting a symbol
from a pathname. See the [reference projects](#reference-projects) for
framework-specific wiring.

#### Next.js 15 App Router

- Route: `src/app/[lang]/predict/[[...symbol]]/page.tsx`. Await `params`,
  reject more than one symbol segment with `notFound()`, and pass `symbol?.[0]`
  to the client view.
- Rendering: use a Client Component boundary for SDK UI. Browser-only imports
  can use `next/dynamic` with `ssr: false` inside that boundary.
- Navigation: use `router.replace` for `replace: true`, otherwise
  `router.push`.
- Locale middleware: match both the base and exact-symbol paths without
  changing the contract or query.

#### Remix 2

- Route: a single `app/routes/$lang.predict.($symbol).tsx` handles both base
  and symbol URLs; read `symbol` through Remix `useParams`. An existing parent
  with `Outlet` plus `_index` and `$symbol` children is also valid; choose one
  structure.
- Rendering: keep the framework router and root providers. Ordinary route
  components render on the server and client; use a hydration boundary only for
  browser-only content. Do not render `.client` exports on the server.
- Navigation: use `useNavigate` from `@remix-run/react` with `{ replace }`; do
  not install React Router 7.

#### Vite / React Router 7

- Route: add `predict/:symbol?` to the existing `baseRoutes` under `:lang`,
  wherever the host declares them (`src/appRouter.tsx` or `src/routes.tsx`).
- Rendering: reuse `OrderlyProvider` and its `Outlet`.
- Navigation: use `navigate(href, { replace })`, and create the router once
  after initial locale normalization, as shown in the
  [Vite reference](#vite-reference).

#### All frameworks

- Extend the existing route path constants (`PathEnum` in this example) with
  `Prediction = "/predict"`. Keep this a base path, never a market family or
  hardcoded round. Add a corresponding page title using the host's title
  convention. If titles are derived from the pathname, map both `/predict`
  and `/predict/*` to that title rather than looking up the full round URL or
  using Perps `formatSymbol` for a Binary contract.
- Update the existing navigation callback, storage wrapper, and Trade menu as
  described in [reference host wiring](#reference-host-wiring). An adapter that
  drops `replace` or query strings breaks base-route history.
- Keep `OrderlyAppProvider` in place, including its broker/network configuration,
  wallet connector, icons, plugins, and callbacks. Set or preserve the feature
  flag there.
- If the Perps page keeps a local `symbol` initialized from URL params/props,
  make the URL the source of truth, or synchronize that state on incoming
  params/props changes, so Back/Forward and cross-product return do not show a
  stale Perps market. Preserve its TradingView and sharing configuration.
- Preserve the host's locale loading strategy and extension messages. Follow its
  existing resource-loading or asset-copy workflow when upgrading SDK messages.

### Vite reference

The example uses a Vite application with an existing Orderly provider tree.
File names and imports are illustrative: reuse the host's equivalent modules and
create new files only when needed. For Next.js or Remix, adapt routing and client
boundaries using the [framework differences](#framework-differences) while
retaining the same integration behavior.

Create `src/pages/prediction/page.tsx`:

```tsx
import { useEffect } from "react";
import { useParams } from "react-router";
import { PredictionPage } from "@orderly.network/prediction";
import { useFeatureEnabled } from "@orderly.network/react-app";
import { perpRoute } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout";
import { useNav } from "../../hooks/useNav";
import { getPerpSymbol } from "../../perpSymbolStorage";

export default function PredictionRoute() {
  const { symbol } = useParams();
  const enabled = useFeatureEnabled("prediction");
  const { onRouteChange } = useNav();
  useEffect(() => {
    if (!enabled) {
      onRouteChange(perpRoute(getPerpSymbol(), { replace: true }));
    }
  }, [enabled, onRouteChange]);
  return enabled ? (
    <BaseLayout>
      <PredictionPage symbol={symbol} />
    </BaseLayout>
  ) : null;
}
```

In the module that declares the host's route objects, reuse `lazyImportPage` to
import that module as `PredictionRoute` and append a
`{ path: "predict/:symbol?", element: <PredictionRoute /> }` entry to
`baseRoutes` once. Keep all existing Perps, Markets, Portfolio, and other route
objects.

The router factory below uses those `baseRoutes` beneath the existing `:lang`
parent and `OrderlyProvider`, which already supplies the providers and `Outlet`.
Use this shape in the host's existing router setup; it adds no provider or layout
around the page. Call the factory once during browser bootstrap after initial
locale normalization, and pass its returned router to `AppRoute`. Keep/export the
existing `baseRoutes` at module scope so bootstrap can call
`createAppRouter(baseRoutes)` and render `<AppRoute router={router} />`.
`PerpsRedirect` resolves its destination on each render, so the redirect uses the
locale in the current URL and the latest remembered Perps symbol rather than
values captured when the router was created.

```tsx
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  type RouteObject,
} from "react-router";
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { perpRoute } from "@orderly.network/types";
import { OrderlyProvider } from "./components/orderlyProvider";
import { getPerpSymbol } from "./perpSymbolStorage";

function PerpsRedirect() {
  const { pathname, search, hash } = useLocation();
  const href = generatePath({
    path: perpRoute(getPerpSymbol()).href,
    locale: getLocalePathFromPathname(pathname) ?? undefined,
    search,
  });
  return <Navigate to={`${href}${hash}`} replace />;
}

export function createAppRouter(baseRoutes: RouteObject[]) {
  return createBrowserRouter([
    {
      path: "/",
      element: <OrderlyProvider />,
      children: [
        { index: true, element: <PerpsRedirect /> },
        {
          path: ":lang",
          children: [
            { index: true, element: <PerpsRedirect /> },
            ...baseRoutes,
          ],
        },
      ],
    },
  ]);
}

export default function AppRoute({
  router,
}: {
  router: ReturnType<typeof createAppRouter>;
}) {
  return <RouterProvider router={router} />;
}
```

If the host normalizes unlocalized paths, do it before mounting the application:
when a locale is missing, call `window.location.replace(redirectPath)` with the
original `search` and `hash`, and mount the application only for an
already-normalized URL. Rewriting the URL without navigating or rerendering leaves
no router mounted. Preserve the special `/` redirect to the remembered Perps market.
Create the router once in a browser bootstrap factory, retaining the existing
route objects and lazy imports, rather than on every `AppRoute` render. Keep
subsequent URL-to-locale synchronization in a component beneath `RouterProvider`
using `useLocation` and an effect. Do not call hooks conditionally or depend on
round selection to recreate the router.

### Reference host wiring

#### Navigation callbacks

Update the host's navigation hook (`src/hooks/useNav.ts` in this example) using
this callback, preserving any additional host branches and existing path
mappings (for example, aliases for Portfolio sidebar paths). Use `perpRoute` for
the remembered Perps destination and the SDK `generatePath` to retain the
current locale. Keep the current query string and
hash unless the SDK destination explicitly supplies a replacement for each.
Split off the hash before parsing the query, and append it after the localized
path and query. An explicit trailing `?` or `#` clears the corresponding value:

```tsx
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { perpRoute, type RouteOption } from "@orderly.network/types";
import { getPerpSymbol } from "../perpSymbolStorage";

export function useNav() {
  const navigate = useNavigate();
  const onRouteChange = useCallback(
    (option: RouteOption) => {
      if (option.target === "_blank") {
        window.open(option.href, "_blank", "noopener,noreferrer");
        return;
      }
      const hashStart = option.href.indexOf("#");
      const pathWithSearch =
        hashStart < 0 ? option.href : option.href.slice(0, hashStart);
      const hash =
        hashStart < 0 ? window.location.hash : option.href.slice(hashStart);
      const queryStart = pathWithSearch.indexOf("?");
      const pathname =
        queryStart < 0 ? pathWithSearch : pathWithSearch.slice(0, queryStart);
      const search =
        queryStart < 0
          ? window.location.search
          : pathWithSearch.slice(queryStart);
      const path =
        pathname === "/"
          ? perpRoute(getPerpSymbol()).href
          : pathname.replace(
              /^(\/[a-z]{2})?\/prediction(?=\/|$)/,
              "$1/predict",
            );
      const href = generatePath({
        path,
        locale:
          getLocalePathFromPathname(window.location.pathname) ?? undefined,
        search,
      });
      navigate(`${href}${hash}`, { replace: option.replace });
    },
    [navigate],
  );
  return { onRouteChange };
}
```

Use the locale from the current browser pathname, as above, so a direct localized
URL also works before the provider's locale synchronization effect completes.

Preserve a host-specific basename/custom URL mapping if present. The SDK emits
unprefixed paths; apply the host's prefix exactly once. Update existing language
switch callbacks as well to retain `window.location.search` and `hash`, using
the framework's replacement navigation so page params follow the URL. Never read
`window` at module scope or in a server render to construct these destinations;
the callbacks run in the browser.

#### Navigation compatibility and old links

The SDK keeps emitting legacy `/prediction` hrefs. Register the new `predict/:symbol?` route alongside a legacy redirect under the same `:lang` parent:

```tsx
function LegacyPredictionRedirect() {
  const { pathname, search, hash } = useLocation();
  const path = pathname.replace(/^(\/[a-z]{2})?\/prediction(?=\/|$)/, "$1/predict");
  return <Navigate to={`${path}${search}${hash}`} replace />;
}

// Add to baseRoutes; keep the new predict/:symbol? page route as well.
{ path: "prediction/:symbol?", element: <LegacyPredictionRedirect /> }
```

This preserves the existing encoded symbol, locale, query and hash without decoding/re-encoding the legacy pathname. Use equivalent replacement redirects in other host frameworks.

#### Provider navigation wiring

In the existing `OrderlyProvider` component, call the shared `useNav` hook and pass
its callback to the existing `OrderlyAppProvider`. This component must render
beneath the host's router, as it does in the Vite route tree above.

The excerpt shows the app-provider node within that component.
`existingProviderProps` and `existingChildren` stand for the host's existing
provider props and content, including its `Outlet`. Keep the wallet and locale
wrappers at their existing positions around or within this node:

```tsx
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { useNav } from "../hooks/useNav";

export function OrderlyProvider() {
  const { onRouteChange } = useNav();

  return (
    <OrderlyAppProvider
      {...existingProviderProps}
      onRouteChange={onRouteChange}
    >
      {existingChildren}
    </OrderlyAppProvider>
  );
}
```

Retain the existing direct broker/network props or stable `configStore`, feature
settings, region settings, icons, plugins, and other callbacks in those props.
The explicit `onRouteChange` connects the shared navigation adapter, including
any preserved host-specific branches. SDK round selection and the Trade menu
then reach the same adapter as host navigation. Next.js and Remix use their
existing framework-specific navigation hook at the equivalent provider node.

#### Guarded storage and migration

Implement the host's storage wrapper with the guarded helpers and keep its
callers consistent. The names below match the reference templates; adapt them
to the host. The helpers handle unavailable storage during SSR or in restricted
browsers:

```ts
import {
  getStoredPerpSymbol,
  setStoredPerpSymbol,
} from "@orderly.network/utils";

export const DEFAULT_SYMBOL = "PERP_ETH_USDC";

export function getPerpSymbol() {
  return getStoredPerpSymbol() ?? DEFAULT_SYMBOL;
}

export function setPerpSymbol(symbol: string) {
  setStoredPerpSymbol(symbol);
}
```

For existing applications, migrate a host-owned key to `orderly_perp_symbol`
when preserving that preference is required. Keep an existing valid SDK value;
otherwise pass the legacy value through `setStoredPerpSymbol` before consumers
read it. Reject Binary rounds, tolerate unavailable storage, and confirm the new
value before deleting a valid legacy value, because writes can silently fail.
The SDK does not perform this host-specific migration automatically.

Keep symbol writes in Perps page effects only. A server-side redirect has no
access to browser storage and uses the configured default Perps symbol.

#### Trade menu

Create a Trade menu component (`src/components/layout/customTradeSubMenu.tsx` in
this example). `usePathWithoutLang` stands for the host's way of reading the
current path without its locale prefix. The mount guard also keeps
remembered-symbol reads out of SSR markup when adapting this component to a
server-rendered host.

```tsx
import { useEffect, useState } from "react";
import { TradeSubMenuWidget } from "@orderly.network/markets";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export default function TradeMenu() {
  const path = usePathWithoutLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isPrediction = path === "/predict" || path.startsWith("/predict/");
  const match = path.match(/^\/perp\/([^/]+)$/);
  let symbol: string | undefined;
  try {
    symbol = match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    // Ignore malformed route encoding.
  }
  return mounted ? (
    <TradeSubMenuWidget
      activeKey={isPrediction ? "prediction" : "perps"}
      symbol={symbol}
    />
  ) : null;
}
```

Import this component where the host builds its Scaffold configuration
(`useOrderlyConfig.tsx` in this example). On its existing
Trading `mainMenus` entry, merge `activeHrefs: [PathEnum.Prediction]` with any
existing active paths and add `customSubMenuRender: () => <TradeMenu />`, preserving
the other entries and host custom submenu content. If a custom submenu already
exists, compose its additional product entries through the widget's `items`
callback rather than creating another Trading menu entry.

The mount guard defers widget rendering; it is not a replacement for import-time
SSR compatibility. If an upgraded dependency fails before mounting, capture the
failing server import, preserve any existing SSR bundler configuration, and
report/fix that dependency issue rather than assuming the Prediction page wrapper
fixes the root.

If the root provider builds this configuration before mounting
`OrderlyAppProvider`, do not call `useFeatureEnabled` there to gate menus. Gate
custom entries in components rendered beneath the provider, or pass the existing
authoritative feature setting into configuration generation. The widget handles
its own Prediction flag; built-in market selectors also provide mobile access.

The [reference templates](#reference-projects) demonstrate feature-aware layout
configuration while sharing the same provider setup.

### Navigation contract

Navigation rules:

- Entering `/predict` without a symbol selects the remembered/default market's
  current round once metadata is available and requests the exact URL with
  `replace: true`. Always forward this flag to the host router.
- A symbol identifies one exact contract, such as
  `PERP_BTC5M2608271200_USDC`, rather than a market family. This symbol is an
  illustrative historical round, not a contract to use for a live trading test.
- Refresh, sharing, and browser history restore that contract. Expiry does not
  advance it automatically. The live/next-round controls request another URL;
  the host must accept navigation and pass the new symbol back to the page.
- Invalid or unavailable symbols do not redirect on their own. Only a valid
  contract whose detail request fails with no usable data requests one
  same-market fallback round; the host still accepts that request. See
  [symbol resolution and fallback](../README.md#symbol-resolution-and-fallback).
- The optional `onSymbolChange` receives `{ symbol }` and takes precedence over
  same-product routing. In controlled integrations, update the symbol yourself;
  cross-product navigation still uses `onRouteChange`.
- Only the Perps page writes its remembered symbol. The guarded storage helpers
  reject Binary round symbols and clean up previously stored round symbols.

See [page navigation](../README.md#prediction-page-navigation),
[symbol persistence](../README.md#host-symbol-persistence), and
[Trade sub menu](../README.md#trade-sub-menu) for the complete contracts.

## 3. Keep the shared styles and built-in integrations

Retain the existing import in the application's global stylesheet:

```css
@import "@orderly.network/ui/dist/styles.css";
```

The UI stylesheet includes Prediction and shared trading classes. Keep it on the
same SDK release version. Alternative stylesheet/Tailwind setups are covered in
[Stylesheet](../README.md#stylesheet).

With Prediction enabled:

| Existing SDK surface                                           | Built-in behavior                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `TradingPage` (`@orderly.network/trading`)                     | Prediction market selection and shared desktop/mobile account panels                  |
| Trading Next layouts (`@orderly.network/trading-next`)         | Prediction market selectors; no cross-product account panels                          |
| `MarketsHomePage` (`@orderly.network/markets`)                 | Prediction tab plus supplemental All/favorites rows when `onRouteChange` is available |
| `OrdersModule.OrdersPage` (`@orderly.network/portfolio`)       | Product filtering, Prediction rows, and cancellation                                  |
| `PositionsModule.PositionsPage` (`@orderly.network/portfolio`) | Prediction positions and position history product switches                            |

Continue rendering the standard pages. Manual Prediction extension props and
additional account queries are unnecessary for these built-in integrations.
`MarketsHomePage` inserts the Prediction tab after Crypto and routes selections to
`/predict/<encoded-round-symbol>`; without `onRouteChange`, pass
`onPredictionSelect` to enable it. See
[Perps integration](../README.md#perps-trading-page-integration).

In Portfolio, Orders initially shows All products with All / Perps / Prediction
filters. Positions and Position history initially show Perps with a Prediction
switch; Liquidation remains Perps-only. Keep the existing page props. Custom
`positionProductContent` and `positionHistoryProductContent` callbacks override the
built-in content for their respective tabs.

Both Portfolio pages fall back to the app provider's `onRouteChange` when
`onSymbolChange` / `onPredictionSelect` are omitted; supplied callbacks take
precedence. Preserve the host's `sharePnLConfig` on both pages and its Positions
precision/calculation preferences. See
[Portfolio integration](../README.md#portfolio-integration) and the reference
projects for the page wiring.

## 4. Configure feature visibility and regional restrictions

Prediction is enabled when `features` is omitted, empty, or contains
`prediction: true`. Set `features={{ prediction: false }}` on the existing
`OrderlyAppProvider` to disable the automatic integration.

`TradeSubMenuWidget` hides its Prediction entry automatically. Hosts must hide
their own mobile/side navigation entries using `useFeatureEnabled("prediction")`
and supply a route fallback, as `PredictionRoute` does above. Otherwise a disabled
`PredictionPage` returns `null`. This UI setting does not disable low-level data
hooks or account valuation for existing Binary exposure.

For those custom entries, reuse the pieces the SDK already ships: the label key
`common.predict` from `@orderly.network/i18n`, `PredictionIcon` from
`@orderly.network/ui`, and the destination `predictionRoute()` from
`@orderly.network/types`.

Broker-specific Prediction region restrictions are configured through the
existing provider's `restrictedInfo` prop:

```ts
import type { RestrictedInfoOptions } from "@orderly.network/hooks";

declare const existingRestrictedInfo: RestrictedInfoOptions | undefined;
declare const extraRegions: string[];

const restrictedInfo: RestrictedInfoOptions = {
  ...existingRestrictedInfo,
  predictionRegionRestriction: {
    ...existingRestrictedInfo?.predictionRegionRestriction,
    customRestrictedRegions: [
      ...new Set([
        ...(existingRestrictedInfo?.predictionRegionRestriction
          ?.customRestrictedRegions ?? []),
        ...extraRegions,
      ]),
    ],
  },
};
```

This configuration is optional. When needed, pass
`restrictedInfo={restrictedInfo}` to the existing `OrderlyAppProvider`, keeping
its configuration form (direct props or `configStore`), other props, children,
and site-wide restriction settings unchanged. `extraRegions` contains region/city
names in the same format as the site-wide `customRestrictedRegions`. The example
merges and deduplicates the existing and extra Prediction regions while
preserving the existing `enableDefault`, including an explicit `false`.

Policy semantics:

- The policy and both fields are optional. `enableDefault` defaults to `true`,
  and `customRestrictedRegions` defaults to `[]`.
- With `enableDefault: true`, custom regions are combined with the platform
  Binary list returned by `/v1/product_restricted_areas?product_type=BINARY`.
- With `enableDefault: false`, only custom regions apply; with an empty custom
  list, no Prediction region restriction is applied.
- The policy does not override site-wide restrictions or wallet connection
  limits.
- Restricted users can still view the product, but trading is disabled. Missing
  geo data does not block trading under the current product behavior.
- For custom trading actions, use `useBinaryRegionRestricted` from
  `@orderly.network/prediction`.

## 5. Check the target environment

Start the host with its existing development script and use the URL printed by
that server. Read its environment and endpoints from the host configuration;
keep the API, public/private WebSocket, Operator endpoints, and wallet network
consistent. Do not introduce reference-project ports, endpoints, or environment
switches.

Confirm that `/v1/public/binary/info` returns market metadata in the selected
environment, and that the backend supports the required account fees, trading,
and settlement operations. Report unavailable backend capabilities separately
from code integration results.

## 6. Verify the integration

Use the host's own scripts for typecheck, relevant lint, and build checks. When
the host has no typecheck script, use its installed TypeScript compiler with the
application's tsconfig and `--noEmit` when supported; with TypeScript project
references, check the application project rather than a root that only
references others. Run existing focused route/navigation tests and extend that
harness for changed behavior where needed; do not add a new testing framework
solely for this integration.

The installed framework/tool versions and scripts are authoritative. If a lint
script fails to start because of a pre-existing tooling mismatch, record the
failure and use the installed ESLint with the existing config to check affected
files. Do not change framework versions, bypass peer-dependency checks, or enable
more ignored errors just to make the build green. Missing dependencies require
installation before a meaningful check; `node_modules` existing alone does not
prove it is complete.

If the build configuration ignores type or lint errors (for example Next.js
`typescript.ignoreBuildErrors` or `eslint.ignoreDuringBuilds`), always run the
separate compiler and lint checks. Do not interpret build success as their
replacement.

When the host has no test runner, perform the public-UI checks through available
browser automation and report unavailable checks. For
the feature-disabled case, temporarily set the existing provider's flag to false
in a test fixture or local verification change, check navigation, then restore
the intended setting without reverting unrelated user edits. There is no SDK
localStorage switch that automatically changes this provider flag.

For server-rendered hosts such as Next.js and Remix, also start the built
application with the host's production start script when its build succeeds and
repeat a direct round-URL load/refresh. Inspect both server logs and browser
console for SSR import errors and hydration warnings; a typecheck does not
establish server rendering compatibility. For a Vite SPA, check the production
preview, with SPA history fallback serving both base and round paths in the
eventual deployment host.

### Public UI and account acceptance

Run the checks below using the host's development server and available browser
automation, with its existing mocks for deterministic route tests. For live
checks, obtain a current contract from the target environment's metadata rather
than hardcoding the illustrative historical symbol:

- [ ] Open the localized symbol-less Prediction route. Once metadata loads, it
      fills the exact round URL using replacement navigation. With an earlier
      non-Prediction history entry, one Back action does not revisit an extra
      base-route entry.
- [ ] Refresh a round-specific URL, share it, select another round, and use Back.
      The selected contract follows the URL; expiry alone does not move it.
- [ ] Exercise the host's existing root, localized-root, and symbol-less Perps
      redirects with a query and hash. Client redirects retain the locale, query,
      and hash and use the remembered/default market. Server redirects preserve
      the incoming contract/query where applicable and use their configured
      default; they cannot read localStorage or a URL fragment. Preserve existing
      history behavior and forward requested replacement navigation. Do not add
      new root routes just to match an example.
- [ ] With the host's existing mocks, fail a detail request for a valid contract
      absent from the snapshot. A same-market fallback requests one replacement
      URL, or one `onSymbolChange` in controlled mode. Without a fallback, the
      unavailable view remains. Invalid symbols, mismatched metadata, and failed
      refreshes of already-available data do not themselves request navigation.
- [ ] Switch between Perps and Prediction through the menu and market selectors.
      Check menu highlighting, locale/query/basename preservation, and the remembered
      Perps symbol after returning to `/perp`.
- [ ] Seed the former host storage key with a Perps symbol, then with a Binary
      round. Verify migration preserves a valid preference, rejects rounds,
      respects an existing SDK preference, and tolerates blocked/failed storage.
- [ ] Check desktop and mobile trading views and their styles. Test the host's
      custom navigation entries as well as the built-in menu. Confirm other routes,
      existing menu entries, and wallet/locale composition still work.
- [ ] Open both `/predict` and `/predict/<current-symbol>` without a locale,
      then with `/en` and one supported non-English prefix. Verify that framework
      redirects preserve the exact contract and query, Prediction text is
      translated rather than showing raw i18n keys, and language switching
      retains the query/hash.
- [ ] In Next.js and Remix, directly load and refresh a round URL in the built
      application. Verify successful server responses, client rendering, and no
      new SSR/hydration errors. Reject extra catch-all path segments in Next.js.
- [ ] With a funded account on the intended test environment, check order
      submission, open orders, cancellation, positions, history, and settlement
      in Prediction, Trading, and Portfolio. Custom order rendering should follow
      the
      [order field mapping](../README.md#order-field-mapping).
- [ ] Disable Prediction. Built-in entries disappear, custom entries are hidden,
      and direct Prediction URLs use the host fallback. Existing account valuation
      remains available.
- [ ] Verify unavailable markets, missing fees, and regional restrictions produce
      the expected display and disabled trading behavior.

When a test runner, browser, account session, test funds, backend capability, or
permission to submit the requested trades is unavailable, continue independent
checks and report the exact checks left **not verified**, with reproducible manual
steps. Trading checks require an existing authorized test account and the intended
environment. A checklist, typecheck, or mocked response is not evidence of live
trading. Diagnose failed checks, apply scoped fixes, and rerun the affected checks;
distinguish pre-existing failures with baseline evidence instead of suppressing
diagnostics.

### Troubleshooting

| Symptom                                                      | Check                                                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prediction selection opens a missing page                    | Register both base and symbol routes; merge the route beneath the correct locale prefix.                                                                                 |
| Base route adds an unwanted history entry                    | Forward `RouteOption.replace` to the router.                                                                                                                             |
| Selecting another round leaves the page unchanged            | Update the URL/`symbol`; controlled callbacks only request selection.                                                                                                    |
| Round stays expired                                          | URLs intentionally pin contracts. Use the live-round control and accept its navigation request.                                                                          |
| No markets or an unavailable round                           | Inspect `/v1/public/binary/info` and `/v1/public/binary/info/:symbol` in the configured environment; see [Navigation contract](#navigation-contract) for fallback rules. |
| Prediction menu entry is missing                             | Check `features.prediction` and that `OrderlyAppProvider` receives `onRouteChange`; automatic market navigation requires it.                                             |
| Page is blank after disabling                                | Supply the host route fallback; disabled SDK pages return `null`.                                                                                                        |
| Page is unstyled                                             | Check the global UI stylesheet import and matching SDK versions.                                                                                                         |
| Trading is unavailable                                       | Check wallet/account readiness, collateral, round availability, and Binary region restrictions.                                                                          |
| Fee is unknown                                               | Check actual account Binary fee configuration. Missing/invalid rates are unavailable, not zero; do not invent a fallback rate.                                           |
| Returning to Perps restores a Binary round                   | Use guarded storage helpers and write only from Perps routes.                                                                                                            |
| Base route works but a direct unlocalized round URL does not | Make the locale redirect (for example Next.js middleware) match both `/predict` and `/predict/<symbol>`; preserve the original symbol and query.                         |
| Server import or hydration errors in Next.js/Remix           | Keep the new SDK page behind the framework client boundary; do not statically render a Remix `.client` export or put `ssr: false` in a Next.js Server Component.         |
| Blank page after adding a locale prefix                      | Initial locale normalization must navigate or rerender; a URL-only `replaceState` followed by an early return leaves no router mounted.                                  |

## AI Integration Workflow

Follow this workflow when an AI agent is asked to integrate Prediction into an
existing application. Use the Vite example as the reference contract and adapt it
to the host's existing framework. The
[framework differences](#framework-differences) cover Next.js 15 App
Router, Remix 2, and Vite / React Router 7. For other routers, identify any missing
adapter instead of migrating the application to React Router.

### A. Discover the host before editing

Read repository instructions and the target application's `package.json` and
lockfile. Use its existing package manager. Record the initial Git changes and
preserve unrelated user work. Locate these integration points by searching imports
and usages rather than assuming the reference file paths:

| Integration point | What to identify                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Routing           | Next.js App Router, Remix file routes, or React Router route objects/JSX; parent routes, basename, locale prefix, redirects, and instrumentation |
| Providers         | Existing `OrderlyAppProvider`, Locale/wallet provider order, `configStore`, `onRouteChange`, and `features`                                      |
| Navigation        | Shared Scaffold, Trade menu, custom mobile/side entries, and active-route handling                                                               |
| Persistence       | Last Perps symbol readers/writers and symbol-less Perps redirects                                                                                |
| Styling           | Existing global SDK stylesheet or SDK Tailwind content setup                                                                                     |
| Verification      | Actual typecheck, lint, build, test, and development-server scripts, including package-specific scripts in monorepos                             |

Identify the framework using the [framework differences](#framework-differences).
The `:lang` prefix in the
reference is illustrative: preserve the host's prefix/basename and existing
navigation adapter. An unlocalized host should register `/predict/:symbol?`
and retain its unlocalized adapter instead of adding a Locale route merely to
match this guide. Register both the base and exact-symbol destinations, either
through an optional segment or two equivalent routes.

### B. Check dependencies and inputs

Select the target Prediction version before changing pins:

1. If the host already depends on `@orderly.network/prediction` 3.3.0 or later,
   keep that version.
2. Otherwise, if the host's main SDK packages (such as
   `@orderly.network/react-app` and `@orderly.network/trading`) already share a
   version of 3.3.0 or later, use the Prediction version with the same number.
3. Otherwise, use the latest stable Prediction release.

If the user explicitly requested a preview version, select that exact preview
instead and apply the dependency-alignment checks below to its published
metadata. Do not replace a requested preview with a stable version silently.

Never downgrade a host that is already on a later release. Read the exact package
versions of that release with
`npm view @orderly.network/prediction@<version> dependencies` and align the
host's matching direct dependencies to them. Packages outside that list, such as
`@orderly.network/trading`, `@orderly.network/markets`, and the wallet connector,
normally use Prediction's version number. Confirm every target version in the
host's configured package registry; update existing direct SDK dependencies and
add only packages the integration imports. Preserve independently versioned
plugins and tooling. Confirm wallet connector compatibility before changing its
version. In a workspace SDK checkout, retain `workspace:` dependency ranges rather
than replacing them with registry pins. Update the existing lockfile with the
same package manager.

Keep React, React DOM, and their type packages in one compatible version family.
After upgrading, inspect the dependency tree (for example `npm ls react react-dom
@types/react @types/react-dom`) if SDK components fail JSX type checking. Resolve
incompatible or duplicated React type families through the dependency graph; do
not hide those errors with component casts, ignored compiler errors, or forced
peer installation.

Updating only `prediction` is insufficient. Align the direct SDK packages already
used by the app, retain unrelated dependency changes, and resolve any
upgrade-related API errors before claiming integration success.

Derive the broker, network, endpoints, and wallet/locale configuration from the
host. Keep them unchanged; do not copy example identities, credentials, or temporary
internal versions. If the host lacks its required providers/configuration, or the
selected compatible release cannot be resolved, report the exact missing input
and continue only work that does not depend on it. Do not silently fall back to a
pre-release, mix SDK releases, or switch to a different backend environment.
Missing wallet sessions or test funds do not block coding.

### C. Merge the integration once

Use the examples as contracts to merge into the host, not replacement application
files. On first and subsequent runs:

1. Reuse the single router and existing provider tree. Extend the current
   `onRouteChange` to support Prediction paths and `replace`, preserving its
   external-link handling, route aliases, locale, query string, and basename
   behavior.
2. Reuse an existing Prediction page/route when present; otherwise add the thin
   page based on the reference, passing the accepted URL symbol to
   `PredictionPage`. Retain lazy loading, loaders, guards, error boundaries, and
   instrumented router creation. In a data router, add the child route to the
   existing route objects; do not mount `Routes` or a second `RouterProvider`
   inside them. Next.js and Remix retain their framework routers and the
   client/SSR boundaries listed in the
   [framework differences](#framework-differences).
3. Merge Prediction into the existing Trade menu and active-path rules, retaining
   host entries. Gate custom mobile/side entries with `useFeatureEnabled` and
   provide a disabled-feature route fallback to the remembered/default Perps page.
   Reuse existing translated labels and follow the host's localization workflow
   for any new user-facing copy.
4. Preserve other `features` fields and an existing explicit `prediction: false`;
   report that pre-existing disabled state unless the user requested enabling it.
   Otherwise rely on the default enabled behavior. Preserve all other provider
   props, children, and region settings. Additional region restrictions are opt-in;
   retain the host's values and do not invent a restricted-region list.
5. Replace unguarded Perps symbol storage with the public guarded helpers where
   needed, and keep writes scoped to Perps routes. Reuse an existing stylesheet or
   compatible Tailwind setup; add the UI stylesheet only if neither covers SDK
   styles.
6. Keep standard Trading, Markets, and Portfolio calls. Remove obsolete manual
   Prediction extension wiring only where it is replaced by the built-in
   integration described in the
   [migration reference](../README.md#removed-manual-page-integration-api).

Before validation, inspect the resulting configuration for one Prediction route
per intended parent, one menu entry per intended surface, one provider tree, and
one effective stylesheet setup. If a second run discovers all required wiring,
skip those edits and proceed directly to verification.

### D. Verify and report

Follow [Verify the integration](#6-verify-the-integration) for commands and
acceptance checks. Keep code verification and live trading verification
separate, and report any checks that could not run.

#### Completion report

Report the changed files and their purpose, target/resolved SDK versions, router
mode, effective feature state, validation commands with outcomes, and browser/API
evidence. Identify each remaining prerequisite and the checks it blocks. Use these
completion categories independently:

- **Code integration verified**: dependency installation, typecheck, relevant lint,
  application build, and the route/UI checks all passed for the target app.
- **Code integration implemented; verification incomplete**: wiring is present,
  but one or more checks failed or could not run. List them; do not report full
  success.
- **Trading integration verified**: the requested account/trading scenarios passed
  against the selected backend. Otherwise state **Trading integration not fully
  verified**, even when code integration is verified.

If no suitable host configuration exists and wiring cannot be completed, report
**Integration blocked** with the missing inputs and any independent work completed.

---

For standalone account layouts and resource lifecycles, continue with the
[Prediction integration reference](../README.md).
