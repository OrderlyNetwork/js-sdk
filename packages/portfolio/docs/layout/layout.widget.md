# layout.widget.tsx

## Overview

Top-level layout widget: uses `useScreen()` to switch between desktop `PortfolioLayout` and mobile `PortfolioLayoutMobile`. Composes `usePortfolioLayoutScript` and passes state and props to the active layout.

## Exports

### Types

- **`PortfolioLayoutWidgetProps`** — Alias of `PortfolioLayoutProps`

### Components

- **`PortfolioLayoutWidget`** — Renders PortfolioLayout (desktop) or PortfolioLayoutMobile (mobile).

## Usage example

```tsx
<PortfolioLayoutWidget leftSideProps={{ current: "/portfolio" }} routerAdapter={adapter}>
  {children}
</PortfolioLayoutWidget>
```
