# layout.ui.tsx

## Overview

Desktop portfolio layout: Scaffold with left sidebar (SideBar), translated menu items, and route handling via router adapter. Extends ScaffoldProps with optional hideSideBar and items.

## Exports

### Types

- **`PortfolioLayoutProps`** — `ScaffoldProps & { hideSideBar?: boolean; items?: SideBarProps["items"] }`

### Components

- **`PortfolioLayout`** — Renders Scaffold with LeftSidebar; applies classNames for content and sidebar.

## Usage example

```tsx
<PortfolioLayout routerAdapter={adapter} items={customItems}>
  {children}
</PortfolioLayout>
```
