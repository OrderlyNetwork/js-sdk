# ranking.ui.tsx

## Overview

Generic ranking table component. Renders a DataTable with rank/address/points columns, row styling for top 3 and "you", and optional mobile infinite scroll with sentinel.

## Exports

### Types

| Name | Description |
|------|-------------|
| `RankingProps` | Extends GeneralRankingScriptReturn (without dataList/dataSource), adds style, className, fields, dataList, dataSource, type. |

### Component

| Name | Description |
|------|-------------|
| `Ranking` | FC that renders DataTable (desktop with pagination, mobile with sentinel + load more). |

## Props (Ranking)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| style | React.CSSProperties | No | Container style. |
| className | string | No | Container class. |
| fields | RankingColumnFields[] | Yes | Column keys to show (rank, address, points). |
| dataList | RankingData[] | Yes | Data for mobile list. |
| dataSource | RankingData[] | Yes | Data for desktop table. |
| type | "general" \| "campaign" | No | Ranking type. |
| address | string | From script | Current user address for "you" row. |
| isLoading | boolean | From script | Loading state. |
| pagination | object | From script | Desktop pagination. |
| sentinelRef | RefObject | From script | Mobile infinite scroll sentinel. |

## Usage

Used by GeneralRankingWidget; not typically used directly.
