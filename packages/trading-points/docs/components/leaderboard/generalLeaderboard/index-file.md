# index.ts (generalLeaderboard)

## Overview

Barrel file exporting the leaderboard widget, presentational component, and script hook.

## Exports

- `GeneralLeaderboardWidget`, `GeneralLeaderboardWidgetProps`
- `GeneralLeaderboard`, `GeneralLeaderboardProps`
- `useGeneralLeaderboardScript`

## Usage example

```tsx
import { GeneralLeaderboardWidget } from "./index";
<GeneralLeaderboardWidget campaignDateRange={currentStage ? { start_time: currentStage.start_time, end_time: currentStage.end_time } : undefined} />
```
