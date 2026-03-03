# type.ts

## Overview

Shared types for date range selection and leaderboard tabs.

## Exports

### Types

| Name | Description |
|------|-------------|
| `DateRange` | `{ from?: Date; to?: Date; label?: string }` – optional date range with label. |
| `LeaderboardTab` | Enum: `Volume = "volume"`, `Pnl = "pnl"`. |

## Usage example

```typescript
import { DateRange, LeaderboardTab } from "./type";

const range: DateRange = { from: new Date(), to: new Date(), label: "This week" };
const tab = LeaderboardTab.Volume;
```
