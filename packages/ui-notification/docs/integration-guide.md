# Announcement integration and migration guide

Upgrade the related SDK packages together. Existing page-level `routerAdapter`
configuration remains supported. Component props, hook return values and custom
source contracts are documented in the types and JSDoc linked from the
[public exports](../src/index.ts).

## Contents

- [First-time integration checklist](#first-time-integration-checklist)
- [Dependencies and styles](#dependencies-and-styles)
- [1. Configure navigation](#1-configure-navigation)
- [Standalone navigation adapter](#standalone-navigation-adapter)
- [2. Register routes and choose the source](#2-register-routes-and-choose-the-source)
- [Framework route placement](#framework-route-placement)
- [Page titles and server boundaries](#page-titles-and-server-boundaries)
- [Legacy ID destinations](#legacy-id-destinations)
- [Optional mobile return bar](#optional-mobile-return-bar)
- [3. Migrate custom integrations](#3-migrate-custom-integrations)
- [4. Deployment requirements](#4-deployment-requirements)
- [5. Verify the integration](#5-verify-the-integration)
- [Troubleshooting](#troubleshooting)

## First-time integration checklist

- [ ] [Prepare direct dependencies and styles](#dependencies-and-styles).
- [ ] [Register list and detail routes](#2-register-routes-and-choose-the-source)
      under the existing layout and choose the announcement sources.
- [ ] [Connect one navigation callback](#standalone-navigation-adapter) to the
      existing app provider and Scaffold.
- [ ] If needed, add the [mobile return bar](#optional-mobile-return-bar).
- [ ] [Verify routes, navigation, and presentation](#5-verify-the-integration).

## Dependencies and styles

Declare `@orderly.network/ui-notification` as a direct dependency when importing
its pages, components, or hooks, even if Scaffold already installs it transitively.
Check the selected release's published dependency constraints and align the
related SDK packages and lockfile; their version numbers can differ. See the
[common upgrade rules](https://github.com/OrderlyNetwork/js-sdk/blob/main/docs/integration/README.md#common-upgrade-rules).

Load the SDK stylesheet once in the app's global style entry:

```css
@import "@orderly.network/ui/dist/styles.css";
```

Reuse an existing import; a separate announcement stylesheet is not required.
Keep host overrides local to the announcement view. When adding custom classes,
confirm that the final loaded CSS includes them through the SDK stylesheet or
the host's existing style pipeline, including `rtl:oui-rotate-180` for a custom
return arrow.

## 1. Configure navigation

Start with the [README quick start](../README.md#quick-start), then configure
your host router with these rules:

- The page uses `OrderlyAppProvider.onRouteChange` by default. An optional
  `routerAdapter` on the page takes priority; there is no direct page-level
  `onRouteChange` prop.
- Scaffold's bell and cards require `Scaffold.routerAdapter`, even when global
  navigation is configured.
- For `scope: "announcement"`, use only the destination query and hash in
  `option.href`, clearing either when absent. Do not merge removed category,
  source, page or `is_official` parameters back into the URL. The page, bell and
  cards supply this scope for local announcement navigation. Keep other routes'
  existing query/hash behavior unchanged.
- Preserve locale prefixes, the destination hash and `option.replace`. Honor
  `target: "_blank"` for external links; navigate internal links within the app.

For apps also using Prediction, extend the existing callback with the
[shared navigation example](https://github.com/OrderlyNetwork/js-sdk/blob/main/packages/prediction/docs/integration-guide.md#navigation-callbacks)
and reuse it for the app provider and Scaffold. It handles announcement query
replacement without changing suffix inheritance for other navigation.

When using SDK `generatePath`, `search: ""` inherits the browser's current query.
Pass `search: "?"` to clear it explicitly, then remove a trailing empty `?` from
the generated URL before appending the destination hash. Preserve arbitrary host
context and repeated query values supplied by the destination.

### Standalone navigation adapter

An app without Prediction can extend its existing navigation callback with this
host-local helper. It handles announcement destinations while delegating other
routes to the existing handler, preserving their aliases and query/hash rules.

```ts
import type { RouterAdapter } from "@orderly.network/types";

function createRouterAdapter({
  navigate,
  resolvePath,
  onOtherRouteChange,
}: {
  navigate: (href: string, options: { replace?: boolean }) => void;
  resolvePath: (pathname: string) => string;
  onOtherRouteChange: RouterAdapter["onRouteChange"];
}): RouterAdapter {
  return {
    onRouteChange(option) {
      if (option.target === "_blank") {
        window.open(option.href, "_blank", "noopener,noreferrer");
        return;
      }
      if (option.scope !== "announcement") {
        onOtherRouteChange(option);
        return;
      }

      const hashStart = option.href.indexOf("#");
      const beforeHash =
        hashStart < 0 ? option.href : option.href.slice(0, hashStart);
      const hash = hashStart < 0 ? "" : option.href.slice(hashStart);
      const queryStart = beforeHash.indexOf("?");
      const pathname =
        queryStart < 0 ? beforeHash : beforeHash.slice(0, queryStart);
      const search = queryStart < 0 ? "" : beforeHash.slice(queryStart);
      const href = `${resolvePath(pathname)}${search === "?" ? "" : search}${hash}`;
      navigate(href, { replace: option.replace });
    },
  };
}
```

`navigate` bridges to the host router: Remix and React Router can use their
`useNavigate()` result; Next.js can call `router.replace(href)` when `replace` is
true and `router.push(href)` otherwise. `resolvePath` returns only a pathname,
retaining any host route aliases and applying the locale or deployment prefix once.
For a router configured with `basename`, let that router add the basename instead
of adding it again in `resolvePath`.

For locale-prefixed routes, this resolver also preserves the templates' `/`
alias for returning to the remembered Perps market. Supply the host's existing
guarded `getPerpSymbol` helper and retain any additional host aliases in the path
mapping. Browser location is read when navigating, not at module initialization
or during SSR.

```ts
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { perpRoute } from "@orderly.network/types";

function createLocalePathResolver(getPerpSymbol: () => string) {
  return (pathname: string) => {
    const path = pathname === "/" ? perpRoute(getPerpSymbol()).href : pathname;
    const href = generatePath({
      path,
      locale: getLocalePathFromPathname(window.location.pathname) ?? undefined,
      search: "?",
    });
    return href.endsWith("?") ? href.slice(0, -1) : href;
  };
}
```

Use `createLocalePathResolver(getPerpSymbol)` as `resolvePath`. For the
basename-only template, keep the same `/` to Perps mapping without `generatePath`
or a locale prefix; the router supplies the basename.

Create the adapter in the existing router/provider setup using the host's
`navigate`, `resolvePath`, and `onOtherRouteChange` implementations. Share it
between the provider and Scaffold rather than adding another provider tree:

```tsx
const routerAdapter = createRouterAdapter({
  navigate,
  resolvePath,
  onOtherRouteChange,
});

<OrderlyAppProvider {...appProps} onRouteChange={routerAdapter.onRouteChange}>
  <Scaffold routerAdapter={routerAdapter}>
    <AnnouncementCenterPage slug={slug} />
  </Scaffold>
</OrderlyAppProvider>;
```

The SDK supplies `scope: "announcement"` for its announcement links. A host's
custom announcement buttons must supply it too. These helpers illustrate the
same behavior as the templates' shared `useNav`; an existing adapter can add the
announcement branch directly without introducing another wrapper.

To override navigation for the page only:

```tsx
<AnnouncementCenterPage slug={slug} routerAdapter={routerAdapter} />
```

## 2. Register routes and choose the source

| Host route            | Rendered SDK page                        |
| --------------------- | ---------------------------------------- |
| `/announcement`       | `<AnnouncementCenterPage />`             |
| `/announcement/:slug` | `<AnnouncementCenterPage slug={slug} />` |

Pass the route segment as `slug`, and configure your server to support refreshing
or directly opening detail URLs.

The default Scaffold bell, cards, and View all action emit local detail/list
destinations. Register both routes above, reusing an existing list route, or map
those destinations to working custom host views. Adding a separate menu entry
is optional; exposed SDK links still need working destinations.

Keep the detail URL's `is_official` parameter: `true` selects an official post;
`false` or an absent value selects a platform post. Platform posts require the
globally configured `brokerId`. The same slug may exist in both sources.
The optional page prop `isOfficial` overrides the URL parameter.

Official announcements are **included by default** (`excludeOfficial=false`). To
exclude them, merge this setting into your existing widget configuration:

```tsx
<OrderlyAppProvider
  {...appProps}
  widgetConfigs={{
    ...appProps.widgetConfigs,
    announcement: {
      ...appProps.widgetConfigs?.announcement,
      excludeOfficial: true,
    },
  }}
>
  {children}
</OrderlyAppProvider>
```

This setting applies to the bell, cards, list and details. Without a broker,
the default configuration shows only official posts; explicitly excluding
official posts leaves ordinary announcement views empty. Maintenance reminders
remain available independently.

### Framework route placement

These patterns match the integration templates; adapt their layout names to the
existing host. Keep a single Scaffold around the list and detail views, and pass
the current route's `slug` whenever the URL changes.

| Host                                       | Route placement and page wiring                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router                         | Under `app/[lang]/announcement`, use `page.tsx` for the list and `[slug]/page.tsx` for detail. In the Next.js 15 template, await `params` in the detail server page and pass `slug` into a `"use client"` view rendering `AnnouncementCenterPage`. Share the existing layout and include `/announcement` in the host's locale middleware path handling. |
| Remix                                      | Use `$lang.announcement.tsx` for the shared layout with `Outlet`, `$lang.announcement._index.tsx` for the list, and `$lang.announcement.$slug.tsx` for detail. Read `slug` with `useParams` in the detail page.                                                                                                                                         |
| Vite / React Router                        | Register `announcement/:slug?` under the existing language parent, lazy-load the page as the host does for other pages, and pass `useParams().slug` to the SDK page.                                                                                                                                                                                    |
| React Router with a basename (dex-creator) | Register an `announcement` layout with an index child and a `:slug` child. Keep the existing router basename; route definitions and navigation targets remain app-relative.                                                                                                                                                                             |

Locale normalization must retain the destination query, including `is_official`,
and client hash. A deployed SPA needs history fallback for both list and detail
URLs; SSR hosts must resolve those URLs through their server routing.

### Page titles and server boundaries

Include both the list and detail paths in the host's title mapping, including
prefix matching for `/announcement/:slug` when titles are selected by pathname.
Use the host's existing metadata or document-title mechanism; custom SEO settings
are optional. A localized heading can reuse `notification.announcements`.

Keep route constants and server metadata independent of client-only SDK imports.
For example, the Next.js template uses the SDK's exported English locale JSON
for a static title rather than importing the React i18n entry into shared server
constants. Hooks and interactive SDK views belong inside the framework's
appropriate rendering boundary; do not read `window` during server rendering.

### Legacy ID destinations

For custom or adapter-inserted rows, preserve the slug and `is_official` metadata
or an explicit custom `url`. Without complete slug/source metadata, generated
links fall back to `/announcement/<announcement_id>`. Passing that segment as
`slug` still performs slug lookup; it does not automatically select ID lookup.

If retaining legacy ID navigation, map those links to a distinct host ID route
and render `<AnnouncementCenterPage id={id} />`, with no `slug` prop. Keep the
normal slug route unchanged: a digits-only slug is valid and must not be
classified as an ID solely because it is numeric. For new adapter rows, prefer
complete slug/source metadata or an explicit URL to your chosen host view.

### Optional mobile return bar

A demo-style mobile return bar is host UI, not an automatic part of registering
`AnnouncementCenterPage`. If the app needs it, supply it through `Scaffold.topBar`
(and forward that prop through any host layout wrapper). Leave it undefined on
desktop to retain the normal navigation. Keep exactly one Scaffold around the page.

Use the current route's `slug` and query to build explicit return destinations:

| Current view                             | Return destination                                              | Query cleanup                                                                      |
| ---------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Article detail, including a numeric slug | Announcement list                                               | Remove `is_official`; retain list `category`, `source`, `page`, and other context. |
| Announcement list                        | `/`, resolved by the host adapter to the remembered Perps route | Remove `is_official`, `category`, `source`, and `page`; retain other context.      |

Like the four templates, this host handler sends `/` for list-to-trading
navigation. The shared adapter resolves it using the guarded Perps preference,
not a Prediction round symbol. It accepts current route state and the existing
global navigation callback:

```ts
import type { RouteOption } from "@orderly.network/types";

function returnFromAnnouncement({
  slug,
  search,
  onRouteChange,
}: {
  slug?: string;
  search: string;
  onRouteChange: (option: RouteOption) => void;
}) {
  const params = new URLSearchParams(search);
  params.delete("is_official");
  if (!slug) {
    params.delete("category");
    params.delete("source");
    params.delete("page");
  }
  const path = slug ? "/announcement" : "/";
  const query = params.toString();
  onRouteChange({
    href: query ? `${path}?${query}` : path,
    name: slug ? "announcement" : "perp",
    scope: "announcement",
  });
}
```

The shared adapter adds the locale or router basename once and clears the old
hash. These are explicit destinations, so they also work after opening a detail
URL directly, without requiring browser history. Preserve broker/network and
arbitrary host parameters, including repeated values; avoid rebuilding the query
from an allowlist. A host with additional announcement-only filters should define
their cleanup explicitly.

Position the button with logical classes such as `oui-start-4`, and apply
`rtl:oui-rotate-180` to the left-pointing back arrow. The document direction
controls the CSS variant without a separate direction hook. The return button
displays only an arrow; the centered heading can reuse the SDK's
`notification.announcements` translation.

If replacing the mobile heading, avoid displaying the SDK page heading twice and
check spacing on list, detail, loading, and error views. Keep these style overrides
local to the announcement layout. Test desktop navigation, LTR/RTL, numeric slugs,
both return destinations, context preservation, and empty query/hash cleanup.

## 3. Migrate custom integrations

Scaffold and the announcement page provide announcement data automatically. For
custom entry points without Scaffold, wrap them in one `AnnouncementProvider`
inside your existing Orderly app providers:

```tsx
import { AnnouncementProvider } from "@orderly.network/ui-notification";

<AnnouncementProvider>
  <CustomHeader />
  <AnnouncementCenterPage slug={slug} />
</AnnouncementProvider>;
```

| Existing customization                       | Migration                                                                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Carousel built from `useAnnouncement().tips` | Use `cardTips` for the carousel. Keep `tips` for the bell; its ordinary announcements come from the first server page (size 5), with adapter and market filtering applied, plus maintenance reminders.        |
| Custom bell using `tips`                     | For access beyond the first server page, wire `AnnouncementCenterUI.onViewAll` to the list or provide a paginated host view. Scaffold already wires View all.                                                 |
| Custom unread indicator                      | Use `hasUnread`. Call `openMessageCenter()` when opening the bell. `closeTips()` dismisses cards without clearing unread.                                                                                     |
| Initial-load popup                           | Ordinary announcements now load silently. New publication/update notifications can open eligible cards; production cards expire at their configured deadlines. Maintenance retains its own reminder behavior. |
| `dataAdapter.announcementList`               | It applies to bell and paginated list reads, not cards, details or maintenance. Filtering the list does not hide a post's detail or card.                                                                     |
| Adapter edits to `message`                   | Update translated titles for title-based rows. Preserve slug/source metadata and explicit custom URLs.                                                                                                        |
| Adapter filtering or inserted rows           | Pagination totals remain server totals; filtered pages can be short or empty.                                                                                                                                 |
| Custom `API.AnnouncementRow[]` passed to UI  | Convert to `AnnouncementSummary[]`; API categories are uppercase and UI categories are lowercase.                                                                                                             |

For a custom carousel, `openAnnouncement` below is your host's URL handler. Forward
local announcement destinations with `scope: "announcement"` and honor external
link targets, following the navigation rules above.

```tsx
import {
  NotificationUI,
  useAnnouncement,
} from "@orderly.network/ui-notification";

function CustomCards({
  openAnnouncement,
}: {
  openAnnouncement: (href: string) => void;
}) {
  const state = useAnnouncement();
  if (!state.showAnnouncement) return null;

  return (
    <NotificationUI
      dataSource={state.cardTips ?? []}
      onClose={state.closeTips}
      onItemClick={(href) => {
        state.closeTips();
        openAnnouncement(href);
      }}
    />
  );
}
```

For existing message-based custom rows, convert categories explicitly:

```ts
import type { API } from "@orderly.network/types";
import type { AnnouncementSummary } from "@orderly.network/ui-notification";

const categoryToUi: Record<
  NonNullable<API.AnnouncementRow["category"]>,
  NonNullable<AnnouncementSummary["category"]>
> = {
  CAMPAIGN: "campaign",
  LISTINGS: "listing",
  DELISTINGS: "delisting",
  UPDATES: "update",
  LEGAL: "legal",
  OTHERS: "others",
};

function toUiSummary(row: API.AnnouncementRow): AnnouncementSummary {
  const { category, ...summary } = row;
  return {
    ...summary,
    category: category === undefined ? undefined : categoryToUi[category],
  };
}
```

For custom ownership of all announcement views, use
`AnnouncementArticlesContext` with your own localized data, card state and detail
loading. Custom sources are responsible for source visibility.

## 4. Deployment requirements

The backend must support the current announcement contract; there is no fallback
to older endpoints or response formats:

- `/v2/public/announcement`: paginated, title-based rows with
  `meta: { total, records_per_page, current_page }` in the response's `data`.
- `/v2/public/announcement/active`: active articles with content and card deadlines.
- `/v2/public/announcement/detail`: slug lookup scoped by official source or broker.
- WebSocket topics `{broker_id}$announcement` and, when official posts are enabled,
  `orderly_official$announcement`.

Content is available in `en`, `zh`, `es`, `fr`, `ja` and `ko`, with English fallback
for unsupported or incomplete translations. Regional language variants use their
supported base language. Preserve query parameters and hashes
when changing the URL's locale prefix.

## 5. Verify the integration

Complete the applicable checks against the target backend. Record unavailable
integration checks before rollout.

- [ ] The backend supports the documented endpoints and subscription topics.
- [ ] Bell, card, and View all links use the intended router adapter and resolve
      to SDK pages or mapped host views. List/detail direct entry, refresh, slug
      changes, and Back/Forward navigation work.
- [ ] List source filtering uses `source=official` or `source=community`; selecting
      all removes `source`. Changing source removes `is_official` and `page` while
      retaining the category and repeated context parameters. Category, page, and
      source navigation do not restore removed query parameters or hashes.
- [ ] Slug detail lookup uses `is_official=true` for official posts and `false` or
      an absent parameter for platform posts, unless overridden by the page's
      `isOfficial` prop. The list's `source` filter does not select the detail
      source. Returning to the list removes `is_official` and retains list context.
- [ ] Locale prefixes and destination hashes are preserved where supplied;
      replacement navigation avoids an extra history entry, external link targets
      are respected, and locale switching retains destination query and hash.
- [ ] Router basename and locale normalization apply prefixes once. List/detail
      titles, global SDK styles, and desktop/mobile layouts render correctly;
      direct SSR loads respect the host's rendering boundaries.
- [ ] If adding a mobile return bar, detail-to-list removes `is_official` while
      retaining list `category`, `source`, and `page`; list-to-trading removes all
      four announcement parameters and restores a valid Perps symbol. Other
      context, including repeated parameters, survives. Old hashes are cleared,
      RTL arrows work, and desktop navigation is retained.
- [ ] Official/platform posts follow the configured visibility and broker. A
      detail slug shared by both sources opens the selected source.
- [ ] Ordinary announcements do not open cards on initial load. Eligible new
      notifications and card deadlines behave as intended.
- [ ] Custom carousels use `cardTips`; opening the bell updates unread state, and
      closing cards does not clear it. Custom adapters and converted rows render
      correctly, including short or empty filtered pages.
- [ ] Custom bells provide access beyond the first server page when needed.
      Any retained legacy ID links use explicit ID lookup; numeric slugs still
      use slug lookup.
- [ ] The host's typecheck, relevant lint, build, and focused navigation checks pass.

### Troubleshooting

| Symptom                                                     | Check                                                                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bell, card, or View all links do nothing                    | Connect both provider and Scaffold callbacks; see [navigation setup](#1-configure-navigation).                                                                                       |
| Detail URLs work through clicks but fail on refresh         | Register the detail route and configure server routing or SPA history fallback; see [framework route placement](#framework-route-placement).                                         |
| Removed filters or an old hash reappear                     | Forward `scope: "announcement"`, use destination suffixes only, and explicitly clear `generatePath` query inheritance; see the [standalone adapter](#standalone-navigation-adapter). |
| Locale or deployment prefix appears twice                   | Apply the prefix once and let a basename-aware router add its own basename; see [framework route placement](#framework-route-placement).                                             |
| Page is unstyled or the custom return arrow does not mirror | Check the global SDK stylesheet and generated host classes; see [dependencies and styles](#dependencies-and-styles).                                                                 |
| Direct SSR load reports hook or server import errors        | Check client rendering boundaries and server-safe title/route imports; see [page titles and server boundaries](#page-titles-and-server-boundaries).                                  |

For version-specific upgrade steps, see the
[SDK Integration and Upgrade Guides](https://github.com/OrderlyNetwork/js-sdk/blob/main/docs/integration/README.md).
