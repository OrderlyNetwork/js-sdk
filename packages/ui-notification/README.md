# @orderly.network/ui-notification

Announcement pages, notification components and hooks for Orderly applications.
Supports an announcement center with article details, bell content, popup cards
and maintenance reminders. Use with Scaffold or custom layouts inside your
existing Orderly app providers.

## Main exports

| Export                                          | Purpose                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `AnnouncementCenterPage`                        | Announcement list and article detail page.                                |
| `AnnouncementCenterUI`                          | Bell content for an announcement summary list.                            |
| `NotificationUI`                                | Presentation component for a notification carousel.                       |
| `AnnouncementProvider`                          | Shares announcement data across custom entry points.                      |
| `useAnnouncement`                               | Announcement summaries, active cards, unread state and dismissal actions. |
| `useAnnouncementList` / `useAnnouncementDetail` | Read announcement pages or individual articles within a provider.         |
| `AnnouncementSummary`                           | Data type for bell and carousel UI.                                       |

## Quick start

Inside your existing wallet and locale providers, use your app configuration
(`appProps`) and host router adapter (`routerAdapter`):

```tsx
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";
import { Scaffold } from "@orderly.network/ui-scaffold";

<OrderlyAppProvider {...appProps} onRouteChange={routerAdapter.onRouteChange}>
  <Scaffold routerAdapter={routerAdapter}>
    <AnnouncementCenterPage />
  </Scaffold>
</OrderlyAppProvider>;
```

This renders the announcement list. To render an article, pass the detail route's
slug, for example `<AnnouncementCenterPage slug="release-notes" />`.
See [route and navigation setup](./docs/announcement-integration-guide.md#1-configure-navigation)
for the host routing requirements.

## Key defaults

- Official announcements are included by default (`excludeOfficial=false`). Set
  `widgetConfigs.announcement.excludeOfficial` to `true` to exclude them.
  Platform announcements use the globally configured `brokerId`.
- The page uses the global `OrderlyAppProvider.onRouteChange`. Its optional
  `routerAdapter` takes priority. Scaffold's bell and cards use
  `Scaffold.routerAdapter`.
- Scaffold and the announcement page supply announcement providers automatically.
  Custom entry points can share an `AnnouncementProvider`.
- Ordinary announcements load silently. Maintenance reminders remain available
  independently of official announcement visibility.

## Documentation

- [Integration and migration guide](./docs/announcement-integration-guide.md):
  navigation, routes, announcement sources, custom UI migration and deployment
  requirements.
- [Public exports](./src/index.ts): follow each exported declaration for its types,
  defaults and English JSDoc.
