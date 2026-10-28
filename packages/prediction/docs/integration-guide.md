# Prediction Integration Guide

Add Prediction to an existing Orderly SDK application by extending its provider,
router, and Trade menu. This guide covers the required wiring; the
[package reference](../README.md) covers SDK behavior and advanced consumers.
For automated integration, also follow the [AI workflow](#ai-integration-workflow).

> [!IMPORTANT]
> Prediction is enabled by default. SDK menus emit legacy `/prediction` hrefs;
> register `/predict` and complete the [navigation wiring](#navigation-callbacks)
> in the same change, or keep `features.prediction: false` until ready.

## Minimal integration checklist

- [ ] [Align SDK dependencies](#1-prepare-dependencies-and-the-host-application).
- [ ] [Add the page and routes](#vite-reference), passing the URL's exact symbol.
- [ ] [Connect navigation](#provider-navigation-wiring) and map SDK hrefs to the
      host route. [Redirect legacy links](#navigation-compatibility-and-old-links)
      only if the host previously exposed `/prediction` routes.
- [ ] [Guard Perps storage](#guarded-storage-and-migration) and
      [add a navigation entry](#trade-menu) as a top-level menu or Trade submenu.
- [ ] [Handle disabled Prediction](#4-configure-feature-visibility-and-regional-restrictions)
      and [verify the integration](#5-verify-the-integration).

## Reference projects

| Framework | Template                                                                                           | Inspect                                               |
| --------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Next.js   | [orderly-js-sdk-nextjs-template](https://github.com/OrderlyNetwork/orderly-js-sdk-nextjs-template) | App Router page/client boundary and locale middleware |
| Remix     | [orderly-js-sdk-remix-template](https://github.com/OrderlyNetwork/orderly-js-sdk-remix-template)   | Optional-symbol route and locale redirects            |
| Vite      | [orderly-js-sdk-vite-template](https://github.com/OrderlyNetwork/orderly-js-sdk-vite-template)     | Browser bootstrap, routing, and lazy-loaded pages     |

Use a template tag or commit compatible with the selected SDK release. A template
tracking a preview does not establish stable-release compatibility. File names,
provider organization, and test tools are examples; adapt them to the host.

## 1. Prepare dependencies and the host application

This guide requires React 18+, `@orderly.network/prediction` **3.3.1 or later**,
and `@orderly.network/i18n` **3.3.1 or later** for `common.predict` in Option A
and custom entries. 3.3.1 is the minimum compatible version, not a fixed
installation version. Select the target before editing dependencies:

1. If the user specifies a stable or preview version, use it after verifying
   that it supports this guide's APIs and i18n keys. If incompatible, report the
   mismatch rather than silently substituting another version.
2. Otherwise keep the host's existing compatible Prediction version.
3. If Prediction is absent or incompatible, prefer the version corresponding
   to the host's main SDK release when that release supports this guide.
4. If no compatible version matches the host's release, select the latest stable
   Prediction release and align the related SDK dependencies to it.

Do not automatically downgrade a host already on a later compatible release.

Align all direct Orderly SDK dependencies to that release, including the wallet
connector after checking its compatibility. Package version numbers can differ
within a release; for example, `@orderly.network/perp` has its own major version.
Read the selected Prediction package's published metadata:

```sh
npm view @orderly.network/prediction@<version> dependencies
```

Published dependency values are constraints: an exact version requires that
version, while a range allows compatible versions within the range. Use those
constraints to choose compatible direct dependencies; do not treat a range as
an exact version for `--save-exact`. After installation, inspect the lockfile's
actual resolved versions and confirm that the host and Prediction use compatible
SDK dependencies, including an i18n version that contains `common.predict`.

For other SDK packages, such as Trading, Markets, and the wallet connector,
confirm the corresponding versions in the host's registry rather than assuming
every package has the same number.
Preserve independently versioned plugins/tooling and workspace `workspace:`
ranges. Keep React, React DOM, and their types in compatible version families.

Add Prediction and only missing direct dependencies imported by the integration.
In the table below, A is an independent top-level menu entry and B is a Trading
submenu; see the [menu options](#trade-menu).

| Package                        | Used for                                | Applies to                           |
| ------------------------------ | --------------------------------------- | ------------------------------------ |
| `@orderly.network/prediction`  | `PredictionPage`                        | A and B                              |
| `@orderly.network/react-app`   | Provider and `useFeatureEnabled`        | A and B                              |
| `@orderly.network/types`       | Route builders and `RouteOption`        | A and B                              |
| `@orderly.network/utils`       | Guarded Perps storage                   | A and B                              |
| `@orderly.network/i18n`        | Localized paths and menu labels         | A and B; 3.3.1+ for `common.predict` |
| `@orderly.network/markets`     | `TradeSubMenuWidget`                    | B                                    |
| `@orderly.network/ui-scaffold` | `Scaffold` and navigation configuration | A and B when using Scaffold          |
| `@orderly.network/ui`          | Custom navigation icons                 | Optional in A and B                  |

For a host already aligned to release 3.3.1, add Prediction with the commands
below. Replace the example version with the version selected by the rules above,
including when using AI to integrate:

```sh
npm install --save-exact @orderly.network/prediction@3.3.1
# pnpm add --save-exact @orderly.network/prediction@3.3.1
# yarn add --exact @orderly.network/prediction@3.3.1
```

Use the host's existing package manager and update its lockfile. Retain its
framework/router, provider tree, broker/network, wallet, locale resources, and
endpoints. Keep the provider's existing configuration form: direct broker/network
props **or** a stable `configStore`. `OrderlyAppProvider` already composes account
and data providers; no additional account or Prediction SWR provider is needed.

## 2. Connect the provider, routes, page, and menu

### Framework differences

The examples use Next.js 15 App Router, Remix 2, and Vite with React Router 7.
These are example versions, not minimum requirements or a tested compatibility
range. Use the host's installed APIs and retain its framework/router.

| Host                | Route and symbol                                                                                                                    | Navigation                                                               | Rendering                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router  | `src/app/[lang]/predict/[[...symbol]]/page.tsx`; in v15 await `params`, reject extra segments with `notFound()`, pass `symbol?.[0]` | `router.replace` for `replace: true`, otherwise `router.push`            | Client Component for SDK UI; browser-only imports may use `next/dynamic` with `ssr: false` inside that boundary                     |
| Remix               | `app/routes/$lang.predict.($symbol).tsx`; read `symbol` through `useParams`                                                         | Existing `useNavigate` from `@remix-run/react`, forwarding `{ replace }` | Preserve root providers and SSR; use a hydration boundary for browser-only content and never render `.client` exports on the server |
| Vite / React Router | `predict/:symbol?` beneath the existing locale parent; read `symbol` through `useParams`                                            | `navigate(href, { replace })`                                            | Existing provider/`Outlet`; create the router once after initial URL normalization                                                  |

Framework params are already decoded; decode only symbols extracted directly
from a pathname. Preserve the host's locale and basename. An unlocalized host
uses `/predict/:symbol?` without adding a locale route.

### Vite reference

Add a thin page, such as `src/pages/prediction/page.tsx`, using the host's existing
layout and navigation hook:

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

Reuse the host's lazy page import and merge this entry into the existing
route list under the same parent:

```tsx
const predictionRoutes = [
  { path: "predict/:symbol?", element: <PredictionRoute /> },
];
```

Add the optional [legacy redirect](#navigation-compatibility-and-old-links) only
when migrating a host that previously exposed `/prediction` routes.
Keep one router and provider tree, including existing loaders, guards, error
boundaries, and instrumentation. Full router/bootstrap examples are in the
[reference projects](#reference-projects).

If locale normalization is needed, handle `/predict` base/symbol paths before
creating the router. Include `/prediction` paths only when supporting an existing
legacy route. Copy the encoded symbol segment without decoding it,
and preserve the query and client hash:
`/predict/PERP_BTC5M2608271200_USDC?network=test#orders` becomes
`/zh/predict/PERP_BTC5M2608271200_USDC?network=test#orders` for locale `zh`.
Either navigate with `window.location.replace`, or use `replaceState` and
continue mounting the router; an early return after URL-only replacement leaves
no router mounted.

Keep existing root and symbol-less Perps redirects, resolving the current locale
and remembered symbol at navigation time. The Perps page must also follow URL
changes after Back/Forward or cross-product navigation.

### Reference host wiring

#### Navigation callbacks

Extend the existing navigation adapter, retaining its route aliases, external
links, and basename handling. The Vite example below maps SDK paths, retains
locale/query/hash, and forwards replacement navigation. An explicit destination
`?` or `#` clears that suffix; an omitted suffix retains the current value.

Share the pathname rewrite between the adapter and legacy redirect. For example,
create `src/predictionPath.ts`:

```ts
const LEGACY_PREDICTION_PATH = /^(\/[a-z]{2})?\/prediction(?=\/|$)/;

export function toPredictPath(pathname: string): string {
  return pathname.replace(LEGACY_PREDICTION_PATH, "$1/predict");
}
```

Import that helper in the existing navigation hook:

```tsx
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { perpRoute, type RouteOption } from "@orderly.network/types";
import { getPerpSymbol } from "../perpSymbolStorage";
import { toPredictPath } from "../predictionPath";

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
          : toPredictPath(pathname);
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

The current pathname supplies the locale even before provider synchronization.
Apply host prefixes once, and preserve query/hash in language-switch callbacks
using the framework's replacement navigation. Browser location reads belong in
browser callbacks, not module scope or server rendering.

#### Navigation compatibility and old links

Every integration maps SDK hrefs through the navigation adapter, including a
first-time integration with no previous Prediction routes:

| SDK request                                                | Host destination before locale/basename handling |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `predictionRoute()` → `/prediction`                        | `/predict`                                       |
| `predictionRoute(symbol)` → `/prediction/<encoded-symbol>` | `/predict/<encoded-symbol>`                      |

`RouteOption.name` and the submenu active key remain `"prediction"`. Only the
host URL segment changes. Custom `onPredictionSelect` callbacks override provider
navigation and must target the host route themselves. See
[route builders](../README.md#route-builders) for the full SDK contract.

**Upgrading a 3.3.0 host:** rename the existing page route from
`prediction/:symbol?` to `predict/:symbol?` and change host path constants such as
`PathEnum.Prediction` from `"/prediction"` to `"/predict"`. Update host menu links
and page-title mappings to the new path. Replace the old page route with the
legacy redirect below; do not register both the old page and the redirect at
`prediction/:symbol?`, where duplicate routes can select the wrong element.
For Next.js or Remix, move the page to the corresponding `/predict` route and
use the old route only for redirection.

**Optional migration:** add `LegacyPredictionRedirect` only if the host previously
exposed `/prediction` base or symbol routes. It preserves existing bookmarks,
shared links, and direct entries when moving to `/predict`. A first-time
integration registers only the new page route; SDK href mapping above is still
required.

```tsx
import { Navigate, useLocation } from "react-router";
import { toPredictPath } from "../predictionPath";

function LegacyPredictionRedirect() {
  const { pathname, search, hash } = useLocation();
  const path = toPredictPath(pathname);
  return <Navigate to={`${path}${search}${hash}`} replace />;
}

// Merge under the same parent as predict/:symbol? only for a legacy migration.
const legacyPredictionRoutes = [
  { path: "prediction/:symbol?", element: <LegacyPredictionRedirect /> },
];
```

Rewrite only the legacy page segment, preserving encoded symbols and URL suffixes;
leave `/predictionish` and `/portfolio/prediction` unchanged. The regex uses the
SDK's two-letter locale prefixes; adapt the shared helper once for other host
locales/basenames, and adjust its import path to the host's file structure.
For a legacy migration in Next.js or Remix, use the existing redirect mechanism
for legacy base and symbol URLs. Server handlers cannot read a fragment; retain
client-side hash handling where required.

#### Provider navigation wiring

Call `useNav` beneath the existing router and pass its callback to the existing
provider, retaining the other props and children:

```tsx
const { onRouteChange } = useNav();

<OrderlyAppProvider {...existingProviderProps} onRouteChange={onRouteChange}>
  {existingChildren}
</OrderlyAppProvider>;
```

#### Guarded storage and migration

Use the [public Perps storage helpers](../README.md#host-symbol-persistence) for
`getPerpSymbol` / `setPerpSymbol`, with the host's configured default. Write only
from Perps routes so Prediction rounds cannot become remembered Perps markets.

If migrating a host-owned key, preserve a valid SDK preference; otherwise pass
the legacy value through the guarded setter. Confirm the new value before
removing a valid legacy value because storage writes may fail. This host-specific
migration is not automatic. Server redirects cannot read localStorage and use
the configured default.

#### Trade menu

Choose the arrangement that fits the host: an independent top-level Prediction
entry or a switcher inside the existing Trading menu. Both use the same
[routes and navigation adapter](#navigation-callbacks).

**Option A: independent top-level entry**

`dex-creator-template` adds Predict alongside Trading in
`Scaffold.mainNavProps.mainMenus`. In the existing configuration hook, merge the
entry into the host's ordered menu list once:

```tsx
const { t } = useTranslation();
const mainMenus = predictionEnabled
  ? [...existingMainMenus, { name: t("common.predict"), href: "/predict" }]
  : existingMainMenus;
```

`useTranslation` comes from `@orderly.network/i18n`. `predictionEnabled` is the
same effective feature setting passed to `OrderlyAppProvider`; a configuration
hook outside that provider should read the host's authoritative setting.
The template derives it from its enabled menu configuration.

Inside the Prediction layout, keep base and round URLs highlighted as one entry:

```tsx
<Scaffold
  {...existingScaffoldProps}
  mainNavProps={{ ...existingMainNavProps, mainMenus, initialMenu: "/predict" }}
  routerAdapter={{
    ...existingRouterAdapter,
    onRouteChange,
    currentPath: "/predict",
  }}
>
  {children}
</Scaffold>
```

These active-path values belong to the Prediction layout; a shared layout must
derive them from the current route. Reuse the filtered menu list in custom mobile
sidebars, as the template does. Bottom navigation is configured separately and
does not gain a Prediction item automatically. The independent entry needs no
`customSubMenuRender` or Prediction `activeHrefs` on the Trading item.

**Option B: switcher inside Trading**

`usePathWithoutLang` below represents the host's locale-free pathname hook.
The mount guard prevents browser preferences from changing initial SSR markup:

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

Extend the existing Scaffold Trading menu: merge `activeHrefs: ["/predict"]` with
existing active paths and add `customSubMenuRender: () => <TradeMenu />`.
Keep `PathEnum.Prediction = "/predict"` if using path constants, and map both base
and symbol URLs to the Prediction page title. Compose existing custom submenu
entries through the widget's `items` callback. See
[Trade sub menu](../README.md#trade-sub-menu) for its props.

When gating custom entries with `useFeatureEnabled`, render them beneath
`OrderlyAppProvider`; outside it, use the host's authoritative setting as in
Option A. The mount guard handles rendering only; it cannot fix import-time SSR
errors. Both arrangements follow the same
[feature visibility and route fallback rules](#4-configure-feature-visibility-and-regional-restrictions).

### Navigation contract

- A URL symbol identifies one exact round. Pass accepted URL changes back to
  `PredictionPage`; refresh and history restore that round, and expiry does not
  advance it automatically.
- Symbol-less entry selects the remembered/default market's current round and
  requests replacement navigation. Always forward `RouteOption.replace`.
- `onSymbolChange` takes precedence for same-product selections; a controlled
  host must accept the selection by updating `symbol` itself.

See [page navigation](../README.md#prediction-page-navigation) for selection
semantics and [symbol resolution and fallback](../README.md#symbol-resolution-and-fallback)
for invalid, unavailable, and historical contracts.

## 3. Built-in integrations

| Existing surface             | Automatic Prediction integration                                                |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `TradingPage`                | Market selectors and shared desktop/mobile account panels                       |
| Trading Next layouts         | Market selectors only                                                           |
| `MarketsHomePage`            | Prediction tab and supplemental All/favorites rows when navigation is available |
| Portfolio Orders / Positions | Product filtering and Prediction account panels                                 |

Keep standard page calls and host props. Built-in navigation uses the
[shared adapter](#navigation-callbacks); custom callbacks retain precedence.
No additional account queries or manual product panels are required. See
[Perps integration](../README.md#perps-trading-page-integration),
[Portfolio integration](../README.md#portfolio-integration), and the
[migration reference](../README.md#migrating-from-earlier-versions).

## 4. Configure feature visibility and regional restrictions

Only an explicit `features.prediction: false` disables Prediction. Preserve other
feature settings and an existing disabled state unless enabling it was requested.
`TradeSubMenuWidget` hides its entry automatically. Gate custom entries with the
same effective setting, or `useFeatureEnabled("prediction")` beneath the provider,
and provide the route fallback shown in the
[page example](#vite-reference). Disabled SDK pages return `null`; account
valuation and independent low-level consumers remain available. See
[application features](../README.md#application-features).

For custom entries, reuse `common.predict`, `PredictionIcon` from
`@orderly.network/ui`, and `predictionRoute()` through the shared adapter.
Additional broker region restrictions are optional: retain existing settings or
follow [regional restrictions](regional-restrictions.md) when configuring them.

## 5. Verify the integration

### Verification prerequisites

Use the host's existing endpoints/network and development script for live checks:

- Public UI: confirm `/v1/public/binary/info` returns metadata and use a current
  round symbol from that environment.
- Trading: confirm backend support for fees, trading, and settlement, plus an
  authorized test wallet, a registered/signed-in Orderly account, and sufficient
  collateral. Code and public navigation checks need no wallet or funds.

### Verification checks

Run the host's typecheck, relevant lint, build, and focused route tests. Use the
application tsconfig with project references; a build that ignores compiler/lint
errors does not replace those checks. Resolve dependency/tooling issues without
forced peer installs, framework changes, casts, or ignored errors. Record
pre-existing failures and unavailable checks separately.

| Check                         | Expected result                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Base route                    | Resolves the current round with replacement navigation; Back skips the extra base entry                                                          |
| Round route                   | Direct load, refresh, sharing, round selection, and Back/Forward follow the URL                                                                  |
| Localization                  | `/predict` base and symbol URLs work with and without locale prefixes; preserve encoding, query, client hash, and history                        |
| Legacy links (migration only) | If the host previously exposed `/prediction`, its base and symbol URLs replace onto `/predict` with locale and suffixes preserved                |
| Navigation adapter            | Explicit/inherited query/hash values work; unrelated paths and existing route aliases are unaffected                                             |
| Perps return and storage      | Cross-product switching restores a valid Perps symbol; guarded migration tolerates blocked/failed storage                                        |
| UI and features               | Desktop/mobile menus, highlighting, styles, and translations work; disabling hides entries and uses the route fallback                           |
| Production routing            | Next.js/Remix direct round loads have no SSR/hydration errors; Next.js rejects extra segments; deployed SPAs serve history fallback              |
| Unavailable data              | Exercise the documented [fallback rules](../README.md#symbol-resolution-and-fallback), missing fees, and region restrictions                     |
| Account flows                 | Authorized live checks cover submission, open orders, cancellation, positions, history, and settlement across Prediction, Trading, and Portfolio |

Use existing mocks for deterministic route/fallback checks and browser checks for
public UI. Test disabled behavior in a fixture or temporary provider setting and
restore the intended configuration afterward. For SSR hosts, repeat direct loads
against the production build and inspect server/browser logs; for SPAs, use the
production preview. Typecheck and mocked tests do not establish live trading.

### Troubleshooting

| Symptom                                                     | Check and reference                                                                                                                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing page, lost query/hash, or extra history entry       | Check the `/predict` page route, basename, preserved query/hash, and forwarded `replace` flag. See [navigation and legacy links](#navigation-compatibility-and-old-links).                                                                                    |
| Blank page after locale normalization                       | Confirm the router still mounts after `replaceState`, or use `location.replace`. See [browser bootstrap rules](#vite-reference).                                                                                                                              |
| Selection does not update the page or round remains expired | Pass URL changes back through `symbol`; accept live-round navigation because an exact-round URL stays pinned. See [navigation contract](#navigation-contract).                                                                                                |
| Missing menus or blank page after disabling                 | Check the effective `features.prediction` setting, custom menu gates, and host route fallback. See [feature visibility](#4-configure-feature-visibility-and-regional-restrictions).                                                                           |
| Menu displays `common.predict`                              | Check that the resolved `@orderly.network/i18n` version is 3.3.1+ and custom locale resources include the key. See [dependencies](#1-prepare-dependencies-and-the-host-application).                                                                          |
| Returning to Perps restores a Binary round                  | Check that only Perps routes write the remembered symbol through the guarded setter. See [guarded storage](#guarded-storage-and-migration).                                                                                                                   |
| Unstyled page or server import/hydration error              | Check the global stylesheet import, matching SDK versions, and browser-only rendering boundary. See [stylesheet reference](../README.md#stylesheet) and [framework boundaries](#framework-differences).                                                       |
| Trading unavailable or unknown fees                         | Check wallet/account readiness, collateral, round availability, fee data, and region settings. See [verification prerequisites](#verification-prerequisites), [Binary fees](../README.md#binary-fees), and [regional restrictions](regional-restrictions.md). |

## AI Integration Workflow

1. **Discover:** read repository instructions, package metadata, lockfile, and
   initial Git changes. Locate the actual provider, router, navigation, Perps
   storage, and verification scripts. Check whether the host
   previously exposed legacy `/prediction` routes.
   Select the actual SDK version using the
   [version selection rules](#1-prepare-dependencies-and-the-host-application);
   3.3.1 is the minimum compatible version, and the installation example is not
   a fixed version requirement.
2. **Choose the menu:** use the user's specified arrangement; otherwise retain
   an existing Prediction menu. When adding a new Prediction menu without a
   specified arrangement, ask the user to choose between an independent top-level
   entry and a Trading submenu before changing the menu. See
   [menu options](#trade-menu).
3. **Implement:** follow the [checklist](#minimal-integration-checklist) using the
   host's existing modules and [framework adapter](#framework-differences).
   Preserve unrelated work and configuration. Reuse existing wiring on repeated
   runs; verify one router/provider tree, one route per intended parent, and one
   menu entry per surface. Add a legacy redirect
   only for an existing `/prediction` route migration; always map SDK hrefs.
4. **Verify:** complete the [checks above](#5-verify-the-integration). Continue
   independent checks when a tool, backend capability, wallet, or funds is missing.
5. **Report:** list changed files, target/resolved SDK versions, router mode,
   feature state, checks with outcomes, and remaining prerequisites. Report code
   integration and live trading verification separately; mark either incomplete
   when its required checks failed or could not run.

For standalone account data, field mappings, and resource lifecycles, use the
[package reference](../README.md#standalone-account-data).
