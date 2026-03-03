# generalLeaderboard.widget.tsx

## Overview

Top-level leaderboard widget: runs useGeneralLeaderboardScript (with optional campaignDateRange) and renders GeneralLeaderboard with the resulting state. Used on the main point system page when a campaign exists and current stage is not pending.

## Exports

### Types

| Name | Description |
|------|-------------|
| `GeneralLeaderboardWidgetProps` | Pick<GeneralLeaderboardProps, "style" \| "className" \| "campaignDateRange">. |

### Component

| Name | Description |
|------|-------------|
| `GeneralLeaderboardWidget` | FC that composes useGeneralLeaderboardScript and GeneralLeaderboard. |

## Props (GeneralLeaderboardWidget)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| style | React.CSSProperties | No | Container style. |
| className | string | No | Container class. |
| campaignDateRange | { start_time: Date \| string; end_time: Date \| string } | No | Campaign period for weekly ranges. |

## Usage example

```tsx
import { GeneralLeaderboardWidget } from "../../components/leaderboard/generalLeaderboard";
const { currentStage } = usePoints();
{!isCurrentStagePending && (
  <GeneralLeaderboardWidget
    campaignDateRange={currentStage ? {
      start_time: currentStage.start_time,
      end_time: currentStage.end_time ?? 0,
    } : undefined}
  />
)}
```
