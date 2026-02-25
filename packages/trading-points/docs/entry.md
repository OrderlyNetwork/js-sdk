# entry (index.ts)

## Overview

Barrel file that re-exports the point system page. This is the main public entry of the package.

## Exports

Re-exports the point system page from `./pages/points/page`.

- `PointSystemPage` – Root page component wrapped with `PointsProvider`.
- `RouteOption`, `PointSystemPageProps` – Types for the page (exported from page.tsx).

## Usage example

```tsx
import { PointSystemPage } from "@orderly.network/trading-points";

function App() {
  const handleRouteChange = (option: { href: string; name: string }) => {
    // navigate to option.href
  };
  return <PointSystemPage onRouteChange={handleRouteChange} />;
}
```
