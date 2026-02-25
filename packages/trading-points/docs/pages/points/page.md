# page.tsx

## Overview

Root point system page component. Wraps the main UI with `PointsProvider` and exposes route change callback.

## Exports

### Types

| Name | Description |
|------|-------------|
| `RouteOption` | `{ href: string; name: string; scope?: string; target?: string }` |
| `PointSystemPageProps` | `{ onRouteChange: (option: RouteOption) => void }` |

### Component

| Name | Description |
|------|-------------|
| `PointSystemPage` | FC that renders `PointsProvider` and `Main` with `onRouteChange`. |

## Props (PointSystemPage)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onRouteChange | (option: RouteOption) => void | Yes | Called when user triggers navigation (e.g. to Perp). |

## Usage example

```tsx
import { PointSystemPage } from "@orderly.network/trading-points";

<PointSystemPage onRouteChange={(opt) => router.push(opt.href)} />
```
