# context.tsx

## Overview

React context for layout: sidebar open state and optional router adapter. Used by layout UI and script.

## Exports

### Context value type

- `sideOpen: boolean`
- `onSideOpenChange: (open: boolean) => void`
- `routerAdapter?: RouterAdapter`

### API

- **`useLayoutContext()`** — Returns current layout context value.
- **`LayoutProvider`** — Provider component. Props: `routerAdapter?`, `children`.

## Usage example

```tsx
<LayoutProvider routerAdapter={adapter}>
  <PortfolioLayoutWidget />
</LayoutProvider>
```
