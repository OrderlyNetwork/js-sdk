# generalRanking.widget.tsx

## Overview

Widget that composes useGeneralRankingScript and the shared Ranking table. Used by the leaderboard and can be used standalone with optional address filter and column fields.

## Exports

### Types

| Name | Description |
|------|-------------|
| `GeneralRankingWidgetProps` | Pick<RankingProps, "style" \| "className" \| "fields"> & GeneralRankingScriptOptions. |

### Component

| Name | Description |
|------|-------------|
| `GeneralRankingWidget` | FC that calls useGeneralRankingScript and renders Ranking. |

## Props (GeneralRankingWidget)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| style | React.CSSProperties | No | Container style. |
| className | string | No | Container class. |
| fields | RankingColumnFields[] | Yes | Columns to show (e.g. ["rank", "address", "points"]). |
| address | string | No | Optional filter by address. |

## Usage example

```tsx
import { GeneralRankingWidget } from "../ranking/generalRanking";
<GeneralRankingWidget fields={["rank", "address", "points"]} />
```
