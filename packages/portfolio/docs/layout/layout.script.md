# layout.script.tsx

## Overview

Layout script: builds sidebar menu items (i18n), tracks current path from router or props, and exposes path enum for routing.

## Exports

### Enums

- **`PortfolioLeftSidebarPath`** — Overview, Positions, Orders, Assets, FeeTier, ApiKey, Setting, History paths (e.g. `/portfolio`, `/portfolio/positions`).

### Types

- **`UseLayoutBuilderOptions`** — `{ current?: string }`

### Hooks

- **`usePortfolioLayoutScript(props)`** — Returns state (e.g. current, items) for layout UI. Syncs `current` from `props.current` or `routerAdapter?.currentPath`.

## Usage example

```ts
const state = usePortfolioLayoutScript({ current: "/portfolio/assets" });
```
