# main.tsx

## Overview

Main layout for the point system: Countdown, Intro, User block, GeneralLeaderboardWidget, and FAQSection. Responsive (mobile/desktop) and conditionally shows user/leaderboard when a campaign exists and current stage is not pending.

## Props (Main)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onRouteChange | (option: RouteOption) => void | Yes | Navigation callback (e.g. to Perp). |

## Dependencies

- `useScreen` – layout (isMobile).
- `usePoints` – `isNoCampaign`, `isCurrentStagePending`.
- Renders: `Countdown`, `Intro`, `User`, `GeneralLeaderboardWidget`, `FAQSection`.

## Usage

Used internally by `PointSystemPage`; not typically imported directly.
