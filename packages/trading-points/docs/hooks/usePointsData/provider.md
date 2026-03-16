# provider.tsx

## Overview

React context that provides the return value of `usePointsData` to the tree. Consumers use `usePoints()` to access it; must be used within `PointsProvider`.

## Exports

### Types

| Name | Description |
|------|-------------|
| `PointsContextValue` | Same as UsePointsDataReturn. |
| `PointsProviderProps` | `{ children: ReactNode }`. |

### Component / Hook

| Name | Description |
|------|-------------|
| `PointsProvider` | FC that runs usePointsData and provides value via context. |
| `usePoints` | Returns context value; throws if used outside PointsProvider. |

## Props (PointsProvider)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Tree that can use usePoints(). |

## Usage example

```tsx
import { PointsProvider, usePoints } from "./provider";

<PointsProvider>
  <MyComponent />
</PointsProvider>

function MyComponent() {
  const { currentStage, pointsDisplay } = usePoints();
  return <div>...</div>;
}
```
