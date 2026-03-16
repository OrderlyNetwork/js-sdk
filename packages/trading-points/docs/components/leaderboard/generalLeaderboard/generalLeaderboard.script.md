# generalLeaderboard.script.ts

## Overview

Hook that manages leaderboard state: campaign weekly ranges, date filter (e.g. 7/14/30/90 days), search, and active tab (Volume/PnL). Uses utils (splitCampaignByWeeks, getCurrentOrAllTimeRange, getDateRange, formatDateRange) and internal useFilter / useSearch.

## Exports

### Types

| Name | Description |
|------|-------------|
| `GeneralLeaderboardScriptReturn` | Return type of useGeneralLeaderboardScript. |
| `FilterDays` | [7, 14, 30, 90] as const. |
| `TFilterDays` | 7 \| 14 \| 30 \| 90. |
| `GeneralLeaderboardScriptOptions` | { campaignDateRange?: { start_time, end_time } }. |

### Functions

| Name | Description |
|------|-------------|
| `useGeneralLeaderboardScript` | Returns filter state, search state, activeTab, onTabChange, useCampaignDateRange, weeklyRanges, currentOrAllTimeRange. |
| `useCampaignWeeklyRanges` | Returns weekly ranges for a campaign date range. |
| `useCurrentWeeklyRange` | Returns weeklyRanges, currentRange, currentOrAllTime, isInCurrentWeek, getCurrentRangeForDate. |

## useGeneralLeaderboardScript options

| Option | Type | Description |
|--------|------|-------------|
| campaignDateRange | { start_time, end_time } | Optional; used to compute weeklyRanges. |

## Return value (main hook)

Includes filterItems, onFilter, dateRange, filterDay, updateFilterDay, setDateRange (from useFilter), searchValue, onSearchValueChange, clearSearchValue (from useSearch), activeTab, onTabChange, useCampaignDateRange, weeklyRanges, currentOrAllTimeRange.

## Usage example

```tsx
const state = useGeneralLeaderboardScript({
  campaignDateRange: currentStage
    ? { start_time: currentStage.start_time, end_time: currentStage.end_time }
    : undefined,
});
<GeneralLeaderboard {...state} />
```
