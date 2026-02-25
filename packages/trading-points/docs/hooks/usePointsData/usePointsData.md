# usePointsData.ts

## Overview

Hook that loads points stages, user statistics, and referral info; computes current stage selection, ref code/link, and formatted points display for selected time range and all-time.

## Exports

### Interfaces

| Name | Description |
|------|-------------|
| `PointsDisplay` | currentPointsDisplay, tradingPointsDisplay, pnlPointsDisplay, referralPointsDisplay, rankingDisplay (all strings). |
| `UsePointsDataReturn` | Return type of usePointsData (see below). |

### Function

| Name | Description |
|------|-------------|
| `usePointsData` | Fetches stages (public), user statistics (private), referral info; returns state and helpers. |

## Return value (UsePointsDataReturn)

| Property | Type | Description |
|----------|------|-------------|
| stages | StagesResponse \| undefined | List of stages. |
| userStatistics | UserStatistics \| undefined | Current user stats for current stage. |
| currentStage | StageInfo \| undefined | Selected stage. |
| setCurrentStage | (stage: StageInfo) => void | Set selected stage. |
| isLoading | boolean | Stages or user stats loading. |
| isStagesLoading, isUserStatisticsLoading | boolean | Per-request loading. |
| isNoCampaign | boolean | No stages available. |
| refLink, refCode | string | Referral link and code. |
| selectedTimeRange | PointsTimeRange | this_week / last_week / all_time. |
| setSelectedTimeRange | Dispatch<SetStateAction<PointsTimeRange>> | Set time range. |
| getRankingUrl | (args) => string \| null | Build ranking API URL. |
| brokerId | string \| number \| undefined | From useConfig. |
| pointsDisplay | PointsDisplay | Formatted values for selected time range. |
| allTimePointsDisplay | PointsDisplay | All-time display (intro). |
| isCurrentStagePending | boolean | currentStage?.status === "pending". |
| isCurrentStageCompleted | boolean | currentStage?.status === "completed". |

## Usage example

```typescript
const {
  currentStage,
  setCurrentStage,
  pointsDisplay,
  getRankingUrl,
  selectedTimeRange,
  setSelectedTimeRange,
} = usePointsData();
```
