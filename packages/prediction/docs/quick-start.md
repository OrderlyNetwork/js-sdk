# Prediction Quick Start

Add Prediction to an existing Orderly SDK application: reuse its providers and
router, register a round-specific route, and let the SDK assemble the trading and
account panels.

For autonomous implementation, start with the [AI Integration Workflow](#ai-integration-workflow),
then adapt the [Vite reference](#vite-reference) to the host
using the [framework differences](#framework-differences).

This guide targets SDK **3.3.0**. Use the same release for every Orderly SDK
package in the host.

## 1. Prepare dependencies and the host application

Use React 18 or later with the host's existing framework: Next.js 15 App Router,
Remix 2, or Vite with React Router 7. Do not install React Router into Next.js or
upgrade Remix to React Router 7 for this integration. The examples are based on
the Orderly [Vite](https://github.com/OrderlyNetwork/orderly-js-sdk-vite-template),
[Next.js](https://github.com/OrderlyNetwork/orderly-js-sdk-nextjs-template), and
[Remix](https://github.com/OrderlyNetwork/orderly-js-sdk-remix-template) templates,
referred to below as "the templates". They use npm and `package-lock.json`; use
the host's existing package manager and lockfile.

First upgrade every Orderly SDK package already listed in the host's
`package.json` to 3.3.0, including its wallet connector, for example
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
| `@orderly.network/portfolio`  | `PortfolioLeftSidebarPath` in `useNav`                                        |
| `@orderly.network/ui`         | Global stylesheet and `PredictionIcon` for custom entries                     |
| `@orderly.network/hooks`      | `RestrictedInfoOptions`, only when configuring Prediction region restrictions |

For example, a host that already depends on the other packages adds only
Prediction:

```sh
npm install --save-exact @orderly.network/prediction@3.3.0
```

These commands do not install or configure the host's wallet provider.

Keep these existing pieces:

- A configured router, Locale Provider, and wallet connector. Keep the existing
  `LocaleProvider`, wallet connector, and `OrderlyAppProvider` composition. Any
  components using router hooks must remain under the host's router.
- The existing provider's `brokerId` / `brokerName` / `networkId` props **or** its
  stable `configStore`, with matching endpoints and wallet network. The
  templates use direct provider props; keep that configuration form.
  Do not add a store just to match a generic example or combine the two exclusive
  provider configuration forms.

Coding, dependency checks, and public-market navigation checks do not require a
connected wallet or funds. Trading acceptance additionally requires a connected
wallet, a registered/signed-in Orderly account, and sufficient available collateral
on the selected test environment.

`OrderlyAppProvider` already composes the SDK configuration and account/data
providers. Add the routes to the existing provider tree; avoid creating a second
account provider or adding a Prediction-specific SWR provider.

## AI Integration Workflow

Follow this workflow when an AI agent is asked to integrate Prediction into an
existing application. Use the Vite example as the reference contract and adapt it
to the host's existing framework. The differences table covers Next.js 15 App
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

Identify the framework using the table in section 2. The `:lang` prefix in the
reference is illustrative: preserve the host's prefix/basename and existing
navigation adapter. An unlocalized host should register `/prediction/:symbol?`
and retain its unlocalized adapter instead of adding a Locale route merely to
match this guide. Register both the base and exact-symbol destinations, either
through an optional segment or two equivalent routes.

### B. Check dependencies and inputs

Use **3.3.0** as the target for the SDK packages described in section 1. Check
availability using the host's configured package registry before changing pins;
update existing direct SDK dependencies and add only packages the integration
imports. Preserve independently versioned plugins and tooling. Confirm wallet
connector compatibility before changing its version. In a workspace SDK checkout,
retain `workspace:` dependency ranges rather than replacing them with registry pins.
Update the existing lockfile with the same package manager.

Keep React, React DOM, and their type packages in one compatible version family.
After upgrading an older template, inspect `npm ls react react-dom @types/react
@types/react-dom` if SDK components fail JSX type checking. Resolve incompatible
or duplicated React type families through the dependency graph; do not hide those
errors with component casts, ignored compiler errors, or forced peer installation.

The Next.js and Remix templates start on SDK 2.8.x; Vite may already be
on 3.x. Updating only `prediction` is insufficient. Align the direct SDK packages
already used by the app, retain unrelated dependency changes, and resolve any
upgrade-related API errors before claiming integration success. These templates
also use the HTTP locale backend: run `npm run copyLocales` after the upgrade and
preserve `public/locales/extend` host messages. A Git hook is not a substitute for
running this step in an automated checkout.

Derive the broker, network, endpoints, and wallet/locale configuration from the
host. Keep them unchanged; do not copy example identities, credentials, or temporary
internal versions. If the host lacks its required providers/configuration, or
3.3.0 cannot be resolved, report the exact missing input and continue only work
that does not depend on it. Do not silently pick another SDK version or a different
backend environment. Missing wallet sessions or test funds do not block coding.

### C. Merge the integration once

Use the examples as contracts to merge into the host, not replacement application
files. On first and subsequent runs:

1. Reuse the single router and existing provider tree. Extend the current
   `onRouteChange` to support Prediction paths and `replace`, preserving its
   external-link handling, route aliases, locale, query string, and basename behavior.
2. Reuse an existing Prediction page/route when present; otherwise add the thin
   page based on the reference, passing the accepted URL symbol to `PredictionPage`. Retain lazy loading,
   loaders, guards, error boundaries, and instrumented router creation. In a data
   router, add the child route to the existing route objects; do not mount `Routes`
   or a second `RouterProvider` inside them. Next.js and Remix retain their
   framework routers and the client/SSR boundaries listed in the differences table.
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
   compatible Tailwind setup; add the UI stylesheet only if neither covers SDK styles.
6. Keep standard Trading, Markets, and Portfolio calls. Remove obsolete manual
   Prediction extension wiring only where it is replaced by the built-in
   integration described in the [migration reference](../README.md#removed-manual-page-integration-api).

Before validation, inspect the resulting configuration for one Prediction route
per intended parent, one menu entry per intended surface, one provider tree, and
one effective stylesheet setup. If a second run discovers all required wiring,
skip those edits and proceed directly to verification.

### D. Verify and report

Follow [Verify the integration](#6-verify-the-integration) for commands, acceptance
checks, and the completion report. Keep code verification and live trading
verification separate, and report any checks that could not run.

## 2. Connect the provider, routes, page, and menu

### Framework differences

All code examples below use Vite template paths and its existing providers.
Adapt those integration points to the host; keep one router, provider tree, and
page layout. Framework-specific code should follow the existing project structure.

| Framework             | Route registration                                                                                                                                                            | Rendering and navigation differences                                                                                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 15 App Router | `src/app/[lang]/prediction/[[...symbol]]/page.tsx`: await `params`, read the optional `symbol` array's first item, and reject extra segments.                                 | Use a Client Component boundary for SDK UI; browser-only imports can use `next/dynamic` with `ssr: false` inside that boundary. Use `router.replace` for `replace: true`, otherwise `push`. Extend locale middleware for both base and exact-symbol paths without changing the contract or query. |
| Remix 2               | Under `app/routes`, use `$lang.prediction.tsx` with `Outlet`, plus `$lang.prediction._index.tsx` and `$lang.prediction.$symbol.tsx`. Read `symbol` through Remix `useParams`. | Keep the framework router and root providers. Load browser-only `.client` content after hydration; do not render its exports on the server. Use `useNavigate` from `@remix-run/react` with `{ replace }`; do not install React Router 7.                                                          |
| Vite / React Router 7 | Add `prediction/:symbol?` to the existing `baseRoutes` under `:lang` in `src/routes.tsx`.                                                                                     | Reuse `OrderlyProvider` and its `Outlet`. Use `navigate(href, { replace })`, and create the router once after initial locale normalization, as shown below.                                                                                                                                       |

For all three templates:

- Extend the existing `PathEnum` with `Prediction = "/prediction"`. Keep this a
  base path, never a market family or hardcoded round. Add a corresponding page
  title using the host's title convention. In Vite's `usePageTitle`, map both
  `/prediction` and `/prediction/*` to that title rather than looking up the
  full round URL or using Perps `formatSymbol` for a Binary contract.
- Update the existing `useNav`, storage wrapper, and Trade menu as described in
  [reference host wiring](#reference-host-wiring). The templates' adapters drop
  `replace` and query strings; leaving them unchanged breaks base-route history.
- Keep `OrderlyAppProvider` in place, including its direct broker/network props,
  wallet connector, icons, plugins, and callbacks. Set or preserve the feature
  flag there. Existing global CSS already imports the UI stylesheet.
- Copy the upgraded SDK locale files with `npm run copyLocales` and keep the host's
  extension JSON. Verify one non-English route as well as English.
- The older Perps pages keep a local `symbol` initialized from URL params/props.
  Make the URL the source of truth, or synchronize that state on incoming
  params/props changes, so Back/Forward and cross-product return do not show a
  stale Perps market. Preserve its TradingView and sharing configuration.

### Vite reference

The example uses a Vite application with an existing Orderly provider tree.
File names and imports are illustrative: reuse the host's equivalent modules and
create new files only when needed. For Next.js or Remix, adapt routing and client
boundaries using the table above while retaining the same integration behavior.

Create `src/pages/prediction/page.tsx`:

```tsx
import { useEffect } from "react";
import { useParams } from "react-router";
import { PredictionPage } from "@orderly.network/prediction";
import { useFeatureEnabled } from "@orderly.network/react-app";
import { perpRoute } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout";
import { useNav } from "../../hooks/useNav";
import { getSymbol } from "../../storage";

export default function PredictionRoute() {
  const { symbol } = useParams();
  const enabled = useFeatureEnabled("prediction");
  const { onRouteChange } = useNav();
  useEffect(() => {
    if (!enabled) {
      onRouteChange(perpRoute(getSymbol(), { replace: true }));
    }
  }, [enabled, onRouteChange]);
  return enabled ? (
    <BaseLayout>
      <PredictionPage symbol={symbol} />
    </BaseLayout>
  ) : null;
}
```

In `src/routes.tsx`, reuse `lazyImportPage` to import that module and append a
`{ path: "prediction/:symbol?", element: <PredictionPage /> }` entry to
`baseRoutes` once. Here `PredictionPage` is the lazy host page, not the SDK export.
Keep all existing Perps, Markets, Portfolio, and other route objects.

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
import { getSymbol } from "./storage";

function PerpsRedirect() {
  const { pathname, search } = useLocation();
  const href = generatePath({
    path: perpRoute(getSymbol()).href,
    locale: getLocalePathFromPathname(pathname) ?? undefined,
    search,
  });
  return <Navigate to={href} replace />;
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

Its unlocalized-path normalization currently rewrites the URL and returns without
rendering the router. Preserve `window.location.search` and `hash` in that
redirect and ensure it triggers a real navigation. For this template, move initial
normalization before `root.render` in `src/index.tsx`: call
`window.location.replace(redirectPath)` when a locale is missing, and mount the
application only for an already-normalized URL. Remove that early-return branch
from `AppRoute`. Preserve its special `/` redirect to the remembered Perps market.
Create the router once in a browser bootstrap factory, retaining the existing
route objects and lazy imports, rather than on every `AppRoute` render. Keep
subsequent URL-to-locale synchronization in a component beneath `RouterProvider`
using `useLocation` and an effect. Do not call hooks conditionally or depend on
round selection to recreate the router.

### Reference host wiring

#### Navigation callbacks

Update Vite's `src/hooks/useNav.ts` using this callback, preserving any additional
host branches. Use `perpRoute` for the remembered Perps destination and the SDK
`generatePath` to retain the current locale. Keep the current query string and
hash unless the SDK destination explicitly supplies a replacement for each.
Split off the hash before parsing the query, and append it after the localized
path and query. An explicit trailing `?` or `#` clears the corresponding value:

```tsx
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { perpRoute, type RouteOption } from "@orderly.network/types";
import { PathEnum } from "../constant";
import { getSymbol } from "../storage";

const routeMap: Record<string, string> = {
  [PortfolioLeftSidebarPath.FeeTier]: PathEnum.FeeTier,
  [PortfolioLeftSidebarPath.ApiKey]: PathEnum.ApiKey,
};

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
          ? perpRoute(getSymbol()).href
          : routeMap[pathname] || pathname;
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

#### Guarded storage and migration

Keep the existing `storage.ts` exports so their callers and Next.js middleware
imports remain valid. Use this implementation in `src/storage.ts` (Next.js/Vite)
or `app/storage.ts` (Remix). It migrates the templates' old key once, through the
SDK guard, and handles unavailable storage during SSR or in restricted browsers:

```ts
import {
  PERP_SYMBOL_STORAGE_KEY,
  getStoredPerpSymbol,
  setStoredPerpSymbol,
} from "@orderly.network/utils";

export const DEFAULT_SYMBOL = "PERP_ETH_USDC";
export const ORDERLY_SYMBOL_KEY = PERP_SYMBOL_STORAGE_KEY;

export function getSymbol() {
  const stored = getStoredPerpSymbol();
  if (stored) return stored;
  if (typeof window === "undefined") return DEFAULT_SYMBOL;
  try {
    const legacy = window.localStorage.getItem("orderly-current-symbol");
    if (legacy) {
      setStoredPerpSymbol(legacy);
      window.localStorage.removeItem("orderly-current-symbol");
    }
  } catch {
    // Storage migration is best-effort.
  }
  return getStoredPerpSymbol() ?? DEFAULT_SYMBOL;
}

export function updateSymbol(symbol: string) {
  setStoredPerpSymbol(symbol);
}
```

Keep `updateSymbol` calls in Perps page effects only. Server middleware has no
access to browser storage: Next.js's server redirect to its configured default
Perps symbol remains valid; do not pretend it restores a browser preference.

#### Trade menu

Create `src/components/layout/customTradeSubMenu.tsx` using the existing
`usePathWithoutLang` helper. The mount guard also keeps remembered-symbol reads
out of SSR markup when adapting this component to a server-rendered host.

```tsx
import { useEffect, useState } from "react";
import { TradeSubMenuWidget } from "@orderly.network/markets";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export default function TradeMenu() {
  const path = usePathWithoutLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isPrediction =
    path === "/prediction" || path.startsWith("/prediction/");
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

Import this component into the existing `useOrderlyConfig.tsx`. On its existing
Trading `mainMenus` entry, merge `activeHrefs: [PathEnum.Prediction]` with any
existing active paths and add `customSubMenuRender: () => <TradeMenu />`, preserving
the other entries and host custom submenu content. If a custom submenu already
exists, compose its additional product entries through the widget's `items`
callback rather than creating another Trading menu entry.

The mount guard defers widget rendering; it is not a replacement for import-time
SSR compatibility. The templates already import Markets and the SDK in root
providers. If an upgraded dependency fails before mounting, capture the failing
server import, preserve any existing SSR bundler configuration, and report/fix that
dependency issue rather than assuming the Prediction page wrapper fixes the root.

The root provider itself calls `useOrderlyConfig` before mounting
`OrderlyAppProvider`. Do not call `useFeatureEnabled` there to gate menus. Gate
custom entries in components rendered beneath the provider, or pass the existing
authoritative feature setting into configuration generation. The widget handles
its own Prediction flag; built-in market selectors also provide mobile access.

### Navigation contract

Navigation rules:

- Entering `/prediction` without a symbol selects the remembered/default market's
  current round once metadata is available and requests the exact URL with
  `replace: true`. Always forward this flag to the host router.
- A symbol identifies one exact contract, such as
  `PERP_BTC5M2608271200_USDC`, rather than a market family. This symbol is an
  illustrative historical round, not a contract to use for a live trading test.
- Refresh, sharing, and browser history restore that contract. Expiry does not
  advance it automatically. The live/next-round controls request another URL;
  the host must accept navigation and pass the new symbol back to the page.
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

| Existing SDK surface            | Built-in behavior                                                                |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `TradingPage`                   | Prediction market selection and shared desktop/mobile account panels             |
| Trading Next                    | Prediction market selectors; no cross-product account panels                     |
| `MarketsHomePage`               | Prediction tab plus supplemental All/favorites rows when navigation is available |
| `OrdersModule.OrdersPage`       | Product filtering, Prediction rows, and cancellation                             |
| `PositionsModule.PositionsPage` | Prediction positions and position history product switches                       |

Continue rendering the standard pages. Manual Prediction extension props and
additional account queries are unnecessary for these built-in integrations.
`MarketsHomePage` inserts the Prediction tab after Crypto and routes selections to
`/prediction/<encoded-round-symbol>`; without application navigation, pass
`onPredictionSelect` to enable it. See
[Perps integration](../README.md#perps-trading-page-integration).

In Portfolio, Orders initially shows All products with All / Perps / Prediction
filters. Positions and Position history initially show Perps with a Prediction
switch; Liquidation remains Perps-only. Keep the existing page props. Custom
`positionProductContent` and `positionHistoryProductContent` callbacks override the
built-in content for their respective tabs.

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
`common.predictions` from `@orderly.network/i18n`, `PredictionIcon` from
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
    enableDefault: true,
    customRestrictedRegions: extraRegions,
  },
};
```

Pass `restrictedInfo={restrictedInfo}` to the existing `OrderlyAppProvider`. Keep
its configuration form (direct props or `configStore`), other props, children,
and site-wide restriction settings unchanged. `extraRegions` contains region/city names in the same
format as the site-wide `customRestrictedRegions`. The policy and both fields are
optional: `enableDefault` defaults to `true`, and `customRestrictedRegions` defaults
to `[]`. By default, custom regions are unioned with the platform Binary list
returned by `/v1/product_restricted_areas?product_type=BINARY`. Set
`enableDefault: false` to skip that platform list and use only custom regions;
with an empty custom list, no Prediction product region restriction is applied.
This policy does not override site-wide restrictions or wallet connection limits.
Restricted users can still view the product; trading is disabled. Missing geo data
does not block trading under the current product behavior. The exported
`useBinaryRegionRestricted` hook is available for custom trading actions.

This configuration is optional. Merge it into the existing provider only when
needed, preserving the host's other restriction settings.

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

Use the host's scripts and the template commands below for typecheck, relevant
lint, and build checks. For other hosts without a typecheck script, use their
installed TypeScript compiler with the application's tsconfig and `--noEmit`
when supported. Run existing focused route/navigation tests and extend that
harness for changed behavior where needed; do not add a new testing framework
solely for this integration.

### Template verification commands

Run these from the target template checkout after installing its dependencies
with its existing npm lockfile and applying the integration.

| Template   | Static checks and build                                                                                                                                  | Browser server                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Next.js 15 | `npm run copyLocales`, `npx --no-install tsc --noEmit --incremental false`, `npm run lint`, `npm run build`                                              | `npm run dev`; use the URL printed by Next.js    |
| Remix 2    | `npm run copyLocales`, `npm run typecheck`, `npm run lint`, `npm run build` (also runs locale copy)                                                      | `npm run dev`; use the URL printed by Remix/Vite |
| Vite       | `npm run copyLocales`, `npx --no-install tsc -p tsconfig.app.json --noEmit`, `npm run lint`, `npm run build` (checks both TypeScript project references) | `npm run dev`; use the URL printed by Vite       |

The installed framework/tool versions and scripts are authoritative. If a lint
script fails to start because of a pre-existing tooling mismatch, record the
failure and use the installed ESLint with the existing config to check affected
files (for example `npx --no-install eslint src` in Next.js). Do not change
framework versions, bypass peer-dependency checks, or enable more ignored errors
just to make the build green. Missing dependencies require installation before a
meaningful check; `node_modules` existing alone does not prove it is complete.

The Next.js template's `next.config.ts` sets both
`typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to true. Always run
the separate compiler and lint checks. Do not interpret build success as their
replacement. Vite's root tsconfig only references other projects; checking that
root with a plain `tsc --noEmit` would not validate its application sources.

None of the templates currently provides a test runner/script. Use an
existing harness if the target app has added one; otherwise perform the public-UI
checks through available browser automation and report unavailable checks. For
the feature-disabled case, temporarily set the existing provider's flag to false
in a test fixture or local verification change, check navigation, then restore
the intended setting without reverting unrelated user edits. There is no SDK
localStorage switch that automatically changes this provider flag.

For Next.js and Remix, also start the built application with `npm run start`
when its build succeeds and repeat a direct round-URL load/refresh. Inspect both
server logs and browser console for SSR import errors and hydration warnings;
a typecheck does not establish server rendering compatibility. Vite's equivalent
production check uses `npm run preview`, with SPA history fallback serving both
base and round paths in the eventual deployment host.

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
- [ ] Switch between Perps and Prediction through the menu and market selectors.
      Check menu highlighting, locale/query/basename preservation, and the remembered
      Perps symbol after returning to `/perp`.
- [ ] Check desktop and mobile trading views and their styles. Test the host's
      custom navigation entries as well as the built-in menu. Confirm other routes,
      existing menu entries, and wallet/locale composition still work.
- [ ] Open both `/prediction` and `/prediction/<current-symbol>` without a locale,
      then with `/en` and one supported non-English prefix. Verify that framework
      redirects preserve the exact contract and query, locale JSON loads without
      stale Prediction keys, and language switching retains the query/hash.
- [ ] In Next.js and Remix, directly load and refresh a round URL in the built
      application. Verify successful server responses, client rendering, and no
      new SSR/hydration errors. Reject extra catch-all path segments in Next.js.
- [ ] With a funded account on the intended test environment, check order
      submission, open orders, cancellation, positions, history, and settlement in Prediction,
      Trading, and Portfolio. Custom order rendering should follow the
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

### Completion report

Report the changed files and their purpose, target/resolved SDK versions, router
mode, effective feature state, validation commands with outcomes, and browser/API
evidence. Identify each remaining prerequisite and the checks it blocks. Use these
completion categories independently:

- **Code integration verified**: dependency installation, typecheck, relevant lint,
  application build, and the route/UI checks above all passed for the target app.
- **Code integration implemented; verification incomplete**: wiring is present,
  but one or more checks failed or could not run. List them; do not report full success.
- **Trading integration verified**: the requested account/trading scenarios passed
  against the selected backend. Otherwise state **Trading integration not fully
  verified**, even when code integration is verified.

If no suitable host configuration exists and wiring cannot be completed, report
**Integration blocked** with the missing inputs and any independent work completed.

### Troubleshooting

| Symptom                                                              | Check                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prediction selection opens a missing page                            | Register both base and symbol routes; merge the route beneath the correct locale prefix.                                                                                                                                                         |
| Base route adds an unwanted history entry                            | Forward `RouteOption.replace` to the router.                                                                                                                                                                                                     |
| Selecting another round leaves the page unchanged                    | Update the URL/`symbol`; controlled callbacks only request selection.                                                                                                                                                                            |
| Round stays expired                                                  | URLs intentionally pin contracts. Use the live-round control and accept its navigation request.                                                                                                                                                  |
| No markets or an unavailable round                                   | Inspect `/v1/public/binary/info` and `/v1/public/binary/info/:symbol` in the configured environment. Check the exact symbol and backend availability. Invalid/mismatched details do not redirect; detail-only historical contracts cannot trade. |
| Prediction menu entry is missing                                     | Check `features.prediction` and `onRouteChange`; automatic market navigation needs a router callback.                                                                                                                                            |
| Page is blank after disabling                                        | Supply the host route fallback; disabled SDK pages return `null`.                                                                                                                                                                                |
| Page is unstyled                                                     | Check the global UI stylesheet import and matching SDK versions.                                                                                                                                                                                 |
| Trading is unavailable                                               | Check wallet/account readiness, collateral, round availability, and Binary region restrictions.                                                                                                                                                  |
| Fee is unknown                                                       | Check actual account Binary fee configuration. Missing/invalid rates are unavailable, not zero; do not invent a fallback rate.                                                                                                                   |
| Returning to Perps restores a Binary round                           | Use guarded storage helpers and write only from Perps routes.                                                                                                                                                                                    |
| Next.js base route works but a direct unlocalized round URL does not | Update both `PathEnum.Prediction` and the middleware's Prediction-prefix branch; preserve the original symbol and query.                                                                                                                         |
| Server import or hydration errors in Next.js/Remix                   | Keep the new SDK page behind the framework client boundary; do not statically render a Remix `.client` export or put `ssr: false` in a Next.js Server Component.                                                                                 |
| Vite shows a blank page after adding a locale prefix                 | Its initial normalizer must navigate or rerender; a URL-only `replaceState` followed by an early return leaves no router mounted.                                                                                                                |
| Translation keys appear after upgrading                              | Run `npm run copyLocales` and verify that the browser loads the upgraded base JSON plus the preserved host extension JSON.                                                                                                                       |

For standalone account layouts and resource lifecycles, continue with the
[Prediction integration reference](../README.md).
