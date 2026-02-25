# layout.ui.mobile.tsx

## Overview

Mobile portfolio layout: MainNavMobile header, scrollable content, and BottomNav footer. Wraps children in LayoutProvider and uses scaffold props (mainNavProps, bottomNavProps, items, current, routerAdapter).

## Exports

- **`PortfolioLayoutMobile`** — FC with `ScaffoldProps`, script state type, and optional `current`.

## Usage example

```tsx
<PortfolioLayoutMobile current={path} routerAdapter={adapter} items={items}>
  {children}
</PortfolioLayoutMobile>
```
