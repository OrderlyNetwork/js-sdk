# types.ts (usePointsData)

## Overview

TypeScript interfaces and types for points stages, user statistics, and time ranges.

## Exports

### Interfaces / Types

| Name | Description |
|------|-------------|
| `StageInfo` | Single stage: stage_id, start_time, epoch_period, end_time, status, stage_name, stage_description, is_continous. |
| `StagesResponse` | `{ rows: StageInfo[] }`. |
| `WeeklyBreakdown` | trading_point, pnl_point, referral_point, rank. |
| `PointsTimeRange` | `"all_time" \| "last_week" \| "this_week"`. |
| `UserStatistics` | stage, address, trading_point, pnl_point, referral_point, stage_rank, stage_points, l1/l2_referral_boost, weekly_breakdown (this_week, last_week). |

#### StageInfo fields

| Field | Type | Description |
|-------|------|-------------|
| stage_id | number | Stage ID. |
| start_time | number | Unix timestamp (seconds). |
| epoch_period | number | Epoch period number. |
| end_time | number \| null | End timestamp or null. |
| status | "active" \| "completed" \| "pending" | Stage status. |
| stage_name | string | Display name. |
| stage_description | string | Description text. |
| is_continous | boolean | Whether stage is continuous. |

#### UserStatistics fields

| Field | Type | Description |
|-------|------|-------------|
| stage | number | Stage ID. |
| address | string | User address. |
| trading_point, pnl_point, referral_point | number | Point breakdown. |
| stage_rank | number | Rank in stage. |
| stage_points | number | Total stage points. |
| l1_referral_boost, l2_referral_boost | number \| null | Referral boosts. |
| weekly_breakdown | { this_week, last_week: WeeklyBreakdown } | Per-week breakdown. |

## Usage example

```typescript
import type { StageInfo, UserStatistics, PointsTimeRange } from "./types";
const stage: StageInfo = { ... };
const range: PointsTimeRange = "this_week";
```
