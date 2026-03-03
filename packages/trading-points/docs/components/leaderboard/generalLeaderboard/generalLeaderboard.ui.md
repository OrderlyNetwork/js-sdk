# generalLeaderboard.ui.tsx

## Overview

Presentational leaderboard: responsive box layout that renders GeneralRankingWidget with fixed columns (rank, address, points). Mobile uses different padding and passes searchValue; desktop uses max-width container.

## Exports

### Types

| Name | Description |
|------|-------------|
| `GeneralLeaderboardProps` | style?, className?, campaignDateRange?, plus GeneralLeaderboardScriptReturn (searchValue, etc.). |

### Component

| Name | Description |
|------|-------------|
| `GeneralLeaderboard` | FC that renders Box + GeneralRankingWidget with fields ["rank", "address", "points"]. |

## Props (GeneralLeaderboard)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| style | React.CSSProperties | No | Container style. |
| className | string | No | Container class. |
| campaignDateRange | { start_time, end_time } | No | Passed to ranking context if needed. |
| searchValue | string | From script | Search filter for address. |
| (other script state) | - | - | From useGeneralLeaderboardScript. |

## Usage

Used by GeneralLeaderboardWidget; can be used with script state directly for custom layouts.
