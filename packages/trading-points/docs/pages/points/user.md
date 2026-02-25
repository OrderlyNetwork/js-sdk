# user.tsx

## Overview

"My Points" section: time range filter (this week / last week / all), current points, ranking, and breakdown cards (trade points, PnL points, referral points) with "Trade now" / "Copy link" actions.

## Exports

### Component

| Name | Description |
|------|-------------|
| `User` | FC that shows user stats and time range selector. |

## Props (User)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onRouteChange | (option: RouteOption) => void | Yes | Called when navigating (e.g. to Perp). |

## Behavior

- Uses `usePoints()` for refLink, selectedTimeRange, setSelectedTimeRange, pointsDisplay, userStatistics, isCurrentStageCompleted.
- When stage is completed, forces "all_time" and hides this_week/last_week options.
- Copy referral link with toast; "Trade now" calls onRouteChange to Perp.

## Usage

Rendered inside Main; receives onRouteChange from page.
