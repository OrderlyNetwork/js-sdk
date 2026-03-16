# countdown.tsx

## Overview

Countdown timer to the current stage start time. Renders only when the current stage status is `"pending"` and `start_time` is in the future. Shows days, hours, minutes, seconds with i18n labels.

## Exports

### Component

| Name | Description |
|------|-------------|
| `Countdown` | FC that shows countdown to `currentStage.start_time`. |

## Props (Countdown)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | string | No | - | Optional CSS class. |

## Behavior

- Uses `usePoints().currentStage`; returns `null` if not pending or no start time.
- Updates every second via `setInterval`.
- Uses `useTranslation()` for "Starts in", "days", "hours", "minutes", "seconds".

## Usage example

```tsx
import { Countdown } from "./countdown";
<Countdown className="my-countdown" />
```
