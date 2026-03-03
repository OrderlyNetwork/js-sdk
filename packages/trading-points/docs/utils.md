# utils.ts

## Overview

Date and campaign time-range utilities: date ranges, formatting, and splitting campaign periods into weeks.

## Exports

### Functions

| Function | Description |
|----------|-------------|
| `getDateRange(offsetDay)` | Returns `{ from, to }` as dates for the last `offsetDay` days up to now. |
| `formatDateRange(date)` | Formats a date to `"yyyy-MM-dd"`. |
| `formatCampaignDate(date \| string)` | Formats to display form like `"Jan 15, 2025 12:00"`. |
| `formatUpdateDate(timestamp)` | Formats a timestamp to `"yyyy-MM-dd HH:mm"`. |
| `splitCampaignByWeeks(campaignDateRange)` | Splits campaign `start_time`–`end_time` into weekly ranges and returns `WeeklyDateRange[]`. |
| `getCurrentWeeklyRange(weeklyRanges, targetDate?)` | Returns the weekly range containing `targetDate` (default now), or null. |
| `getCurrentOrAllTimeRange(weeklyRanges, targetDate?)` | Returns current weekly range or falls back to "All time" / last range. |

### Types

| Type | Description |
|------|-------------|
| `WeeklyDateRange` | `{ from: Date; to: Date; label: string }` |

## Usage example

```typescript
import {
  getDateRange,
  formatDateRange,
  splitCampaignByWeeks,
  getCurrentWeeklyRange,
} from "./utils";

const range = getDateRange(7);
const weeks = splitCampaignByWeeks({
  start_time: new Date("2025-01-01"),
  end_time: new Date("2025-01-31"),
});
const current = getCurrentWeeklyRange(weeks);
```
