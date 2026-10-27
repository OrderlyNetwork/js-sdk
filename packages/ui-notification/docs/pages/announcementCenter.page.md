# announcementCenter.page

## Overview

`AnnouncementCenterPage` renders the announcement center and uses the global
`OrderlyAppProvider.onRouteChange` callback for navigation. An optional
page-level `onRouteChange` overrides the global callback. The former
`routerAdapter` prop has been replaced by `onRouteChange`.

## Exports

### `AnnouncementCenterPage`

React component that wraps `AnnouncementCenterWidget` and dispatches navigation
through the selected callback.

#### Props

| Prop            | Type                            | Required | Description                                                                                   |
| --------------- | ------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `slug`          | `string`                        | No       | Explicit slug lookup, including numeric strings; a non-empty slug takes precedence over `id`. |
| `id`            | `string`                        | No       | Explicit ID lookup. Without either locator, the page shows the list.                          |
| `isOfficial`    | `boolean`                       | No       | Overrides URL `is_official`; defaults to false when both are absent.                          |
| `onRouteChange` | `(option: RouteOption) => void` | No       | Overrides `OrderlyAppProvider.onRouteChange`.                                                 |

Navigation callbacks receive `href`, `name`, and `scope: "announcement"`.
HTTP(S) external links additionally set `target: "_blank"`. Empty URLs are
ignored; without a callback, the page does not navigate.

The `announcement` scope means `href` supplies the full target query. Host
adapters must replace the current query, clearing it for query-free targets,
while retaining locale and hash handling. Merging the old query would restore
deleted category, pagination or source parameters.

## Usage example

```tsx
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";

<OrderlyAppProvider {...appProps} onRouteChange={onRouteChange}>
  <AnnouncementCenterPage slug={slug} />
</OrderlyAppProvider>;

// Optional override, using the same RouteOption contract:
<AnnouncementCenterPage slug={slug} onRouteChange={customOnRouteChange} />;
```
