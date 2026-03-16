# index.ts (usePointsData)

## Overview

Barrel file that exports types, `usePointsData`, `PointsProvider`, and `usePoints`.

## Exports

- `types`: StageInfo, StagesResponse, WeeklyBreakdown, PointsTimeRange, UserStatistics
- `usePointsData` – hook (use outside provider for raw data)
- `PointsProvider`, `usePoints` – context provider and consumer

## Usage example

```tsx
import { PointsProvider, usePoints } from "@orderly.network/trading-points";

function App() {
  return (
    <PointsProvider>
      <MyPointsUI />
    </PointsProvider>
  );
}
function MyPointsUI() {
  const { currentStage, pointsDisplay } = usePoints();
  // ...
}
```
