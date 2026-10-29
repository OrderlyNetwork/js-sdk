# Announcement integration and migration guide

Upgrade the related SDK packages together. Existing page-level `routerAdapter`
configuration remains supported. Component props, hook return values and custom
source contracts are documented in the types and JSDoc linked from the
[public exports](../src/index.ts).

## 1. Configure navigation

Start with the [README quick start](../README.md#quick-start), then configure
your host router with these rules:

- The page uses `OrderlyAppProvider.onRouteChange` by default. An optional
  `routerAdapter` on the page takes priority; there is no direct page-level
  `onRouteChange` prop.
- Scaffold's bell and cards require `Scaffold.routerAdapter`, even when global
  navigation is configured.
- For `scope: "announcement"`, use the query in `option.href` as-is, clearing the
  current query when the destination has none. Do not merge removed category,
  page or `is_official` parameters back into the URL. The page, bell and cards
  supply this scope for local announcement navigation.
- Preserve locale prefixes, the destination hash and `option.replace`. Honor
  `target: "_blank"` for external links; navigate internal links within the app.

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
