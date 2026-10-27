# Announcement integration

`Scaffold` supplies a production announcement provider to the header bell,
cards and announcement pages. It reads the broker from the global
`OrderlyConfigProvider` configuration and includes official announcements by default.

```tsx
<Scaffold>
  <AnnouncementCenterPage slug={slug} />
</Scaffold>
```

`AnnouncementCenterPage` uses `OrderlyAppProvider.onRouteChange` by default.
Configure navigation once on the app provider. An optional page-level
`onRouteChange` callback overrides it; the page no longer accepts `routerAdapter`.
Both callbacks receive a `RouteOption` with `href`, `name` and
`scope: "announcement"`; HTTP(S) external links also set `target: "_blank"`.
Without either callback, the page does not navigate.

Announcement navigation supplies the complete target query. When
`option.scope === "announcement"`, the host must use the query in `option.href`
as-is, including clearing the current query when the target has none. Do not
merge deleted category, page or `is_official` parameters back into the URL.
Preserve locale handling, hashes and external-link behavior in the host adapter.

```tsx
<OrderlyAppProvider {...appProps} onRouteChange={onRouteChange}>
  <AnnouncementCenterPage slug={slug} />
</OrderlyAppProvider>

// Optional navigation override for this page only:
<AnnouncementCenterPage slug={slug} onRouteChange={customOnRouteChange} />
```

Configure official announcement visibility once for all entry points:

```tsx
<OrderlyAppProvider
  {...appProps}
  widgetConfigs={{ announcement: { excludeOfficial: true } }}
>
  <Scaffold>{children}</Scaffold>
</OrderlyAppProvider>
```

`widgetConfigs.announcement.excludeOfficial` defaults to `false`. The broker
always comes from the global configuration; providers and hooks do not override
announcement source options.

Custom `AnnouncementArticlesContext` sources own their supplied data and bypass
production source filtering.
Maintenance reminders are independent of official announcement visibility.

For integrations without Scaffold, the announcement page supplies its own
provider. Wrap custom entry points in `AnnouncementProvider` inside the existing
Orderly app providers to share requests and subscriptions:

```tsx
<AnnouncementProvider>
  <CustomHeader />
  <AnnouncementCenterPage slug={slug} />
</AnnouncementProvider>
```

Nested automatic providers reuse their ancestor's source and options. The
existing `useAnnouncement({ hideTips })` return fields remain available. `tips`
contains the bell's current reading list; `cardTips` contains the independent
carousel, including maintenance reminders and automatic deadline filtering.

## Public reads (v1.6)

This integration uses the v1.6 public-read contract (PRD 7.6), plus direct
slug lookup scoped by `is_official=true` or `broker_id` on the detail endpoint.
There is no fallback to an older backend when slug lookup, `/active` or server
pagination is unavailable.

- The bell requests `GET /v2/public/announcement` with `page=1&size=5`.
  `useAnnouncementArticles().articles` exposes these localized titles.
- The announcement page requests the same endpoint with `category`, `page` and
  `size=20`. The `all` category omits the category parameter; UI categories
  `listing`, `delisting` and `update` map to `LISTINGS`, `DELISTINGS` and `UPDATES`.
  Responses have title-only `rows`, required `total`, and `last_updated_time`.
- `total` is the server's count after category filtering and before pagination.
  Client market filtering and `dataAdapter.announcementList` apply to the current
  page without changing this total or filling the page from subsequent pages.
  A Listings/Delistings page may therefore be short or empty while pagination
  remains available. Out-of-range page URLs are corrected after receiving total.
- Cards request `GET /v2/public/announcement/active` with the source parameters
  and `locale`, without category or pagination. Rows contain complete article
  translations and only announcements with a future card deadline. The SDK
  extracts summaries from those bodies and removes cards when deadlines pass.
  Initialization and carousel selection do not fetch per-card details.
- Active requests send only `en`, `zh`, `es`, `fr`, `ja` or `ko`. Regional variants
  use the supported base language; other UI languages fall back to English.
  Incomplete translations fall back to English for the whole card. Language
  changes refetch active without clearing list or complete detail caches.
- `useAnnouncementDetail(target, isOfficial = false)` accepts `{ slug }` or
  `{ id }` to select the query type explicitly. String arguments remain supported:
  numeric strings select ID lookup, and other strings select slug lookup. It requests
  `GET /v2/public/announcement/detail` with `slug` + `is_official=true` for an
  official post, or `slug` + `broker_id` for a platform post. Official slug requests
  omit `broker_id`; platform slug requests omit `is_official` entirely. Numeric ID
  requests use `announcement_id` and optional `broker_id` as before.
  ID requests do not send `slug` or `is_official`; a default platform source must
  not restrict official ID links or ID-based WebSocket verification. Neither
  request sends `exclude_official`; the SDK also checks source and market
  visibility. Active's locale-trimmed payload is never a complete detail cache.
- All list and active requests include `broker_id` when configured and
  `exclude_official`. `last_updated_time` describes all published announcements
  in that source scope, independently of category, page or active-card expiry.
  Reading it does not create reminders.

Custom lists can use the paginated hook within a provider:

```tsx
const { articles, total, status, retry } = useAnnouncementList({
  category: "listing",
  page: 2,
  size: 20,
});
```

`AnnouncementListQuery`, `AnnouncementListResponse`,
`AnnouncementActiveResponse` and `AnnouncementListValue` are exported types.
Custom `AnnouncementArticlesContext` sources can provide optional `getList`,
`watchList` and `retryList` functions. Without those functions the hook paginates
that custom context's in-memory articles. This does not enable a production API
fallback.

## Slug routes

Public list, active-card, detail and WebSocket payloads carry the backend-generated
`slug`. The list, bell and cards generate `/announcement/:slug?is_official=true|false`
links. Official links explicitly use `is_official=true`; when the parameter is
absent, the detail page defaults to `false` and only matches the configured
broker's platform announcements. Matching never falls back to an official post.
The same slug can identify different official and platform posts.

Use the `slug` page prop for slug lookup. A non-empty `slug` takes precedence
when `id` is also supplied; without either prop the page shows the list. These
props select the query type explicitly, including numeric slugs:

```tsx
// /announcement/release-notes?is_official=true
<AnnouncementCenterPage slug={slug} />
```

The optional page/widget/script `isOfficial` prop overrides the URL parameter.
An absent prop and URL parameter default to `false`. Invalid URL values display
the existing not-found state for slug routes. Numeric ID routes retain their
original behavior independently of the source parameter.

Slug routes query the detail endpoint directly using either the official scope
(`slug` + `is_official=true`) or the configured broker scope (`slug` + `broker_id`).
The route's default `is_official=false` selects platform lookup but is not sent
as an API parameter. Without a broker, platform slug requests are blocked.
Slug routes do not fetch a complete list or depend on the bell/current page or
`dataAdapter.announcementList` for lookup. The returned
detail is checked against the requested slug, source, known version and existing
visibility rules before entering the cache. A mismatched slug/source is a read
error; a 404 or a platform slug without a configured broker shows not-found.
Slug errors have an independent retry and do not fall back to list-based lookup.

Slug requests are isolated by source scope and `(slug, is_official)`. Successful
reads associate the slug with its returned ID and share the complete ID body
cache. List updates, WebSocket verification and recovery invalidate the same body;
ID-based removal clears its slug associations. Slow responses cannot overwrite
newer bodies or restore a publication removed after their request began.

Legacy/custom rows without a slug or known source identity generate numeric ID
links. Explicit adapter `url` values retain priority. Navigation from the list
preserves category, page and other query parameters, and returning to the list
removes `is_official` without leaving a trailing question mark.

The bell and cards merge the current URL query when clicked, so changes after
their initial render are retained. The destination query takes precedence for
colliding keys, and the target announcement's `is_official` overrides the source
parameter. Custom summaries without source metadata use the destination's source
value; links without a source do not inherit the current source. Explicit external
links remain unchanged.

Custom `AnnouncementArticlesContext` sources may implement
`getDetailBySlug(slug, isOfficial)` and
`loadDetailBySlug(slug, isOfficial, force?)` for direct slug reads. The existing
`getDetail(id)` / `loadDetail(id, force?)` signatures are unchanged. Without both
slug methods the hook matches its own supplied articles: complete bodies render
directly; title-only matches load through the custom ID method when provided.
Custom contexts never automatically request the production endpoint.

## Synchronization

- Official subscriptions use `orderly_official$announcement`; broker subscriptions
  use `{broker_id}$announcement`. The legacy topic is not subscribed.
- Pushes refresh the bell, mounted page queries and active cards. Independently,
  the pushed ID is verified against the uncached detail endpoint. An ID missing
  from a page or active response does not establish that it was unpublished.
- Verified publication/update events create one unread reminder per version.
  Cards open when the active response contains the corresponding current body.
  Pending card reminders survive active-read failures; explicit dismissal clears
  them. A silent read arriving before its push cannot swallow the reminder.
- Confirmed not-found responses revoke that ID across all cached views and
  in-flight bodies. Old list/card responses cannot restore removed versions.
  A slow page request does not block detail verification or removal elsewhere.
- Bell, page, active and push-verification failures retry independently at 1, 2,
  4, 8, 16 and then 30 second intervals. Pending pushes remain unacknowledged
  through transient errors or detail responses older than the notified version.
- Initialization, public reconnect, foreground/online recovery and hourly
  reconciliation refresh silently. Recovery invalidates detail bodies so mounted
  detail routes revalidate even when their ID is outside the bell/current page.
- Focus, visible-state changes and pageshow share a 60-second refresh window,
  measured from initialization or the latest refresh of the shared views. Events
  inside that window do not invalidate details or queue another request. Window
  expiry alone does not trigger a refresh. WebSocket updates, public reconnects,
  online recovery and explicit refreshes remain immediate.
- List caches belong to the API/broker/source/category/page/size scope. Active
  reads additionally belong to a content locale. Superseded scope, page and
  language responses cannot overwrite the current view.
- Unread booleans use separate local-storage keys per broker, including a distinct
  no-broker key. Opening the bell acknowledges unread and dismisses the carousel.
- Maintenance reminders continue to use `system_info` / `maintenance_status`.
  They share carousel dismissal, but do not appear in ordinary announcement lists
  or use announcement card deadlines.

The WebSocket transport is unchanged by this integration. Transport tests cover
topic routing, active subscriptions sharing a topic, and a single cleanup call
while the socket is open. Cancellation of queued subscriptions before connection,
repeated cleanup calls, and cleanup after disconnection remain existing transport
limitations. Provider tests use a mocked transport to verify source switching and
cleanup requests; they do not establish those transport guarantees.

## Verification

```sh
pnpm --filter @orderly.network/net test --runInBand --runTestsByPath __test__/announcementSubscription.test.ts src/fetch/index.test.ts
pnpm --filter @orderly.network/storybook test:announcement
pnpm --filter @orderly.network/ui-scaffold test
pnpm --filter @orderly.network/ui-notification build
pnpm --filter @orderly.network/ui-scaffold build
```

Mocked tests cover server query contracts, totals after client filtering,
pagination and language races, shared providers, standalone hooks, active-card
bodies, expiry, push verification, removals, retries and maintenance compatibility.

End-to-end acceptance remains pending: publish, update and unpublish real official
and broker announcements from an authorized administration account, then verify
the header bell, cards, list and open detail page. Under a healthy WebSocket
connection and available REST APIs, removal must complete within five seconds.
Mocked tests and package builds do not establish that integration criterion.

Slug generation and management validation remain backend/admin responsibilities.
Real REST/WebSocket acceptance with backend slug lookup, including source isolation and
direct-link refreshes, must be verified against a deployed backend; mocked tests
do not establish that integration criterion.

The standalone `tsc --noEmit --project packages/ui-notification/tsconfig.build.json`
check is currently blocked by existing dependency type-resolution errors in
ethers (`@noble/hashes`, `@noble/curves`, `@adraffy/ens-normalize`, `ws`) and the
existing `ScrollAreaProps.children` error in the bell UI. Package builds include
declaration output but do not replace this full source check.

The root ESLint command currently cannot resolve Tailwind from its relative
configuration path. The same configured rules were checked using the absolute
`packages/ui/tailwind.config.js` path, without changing repository lint config.
