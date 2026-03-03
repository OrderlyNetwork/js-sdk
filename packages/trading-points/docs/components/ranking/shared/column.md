# column.tsx

## Overview

Defines ranking table columns and the hook to build them: rank (with badges), address (with link and copy), points. Uses i18n and optional current address for "You" label.

## Exports

### Types

| Name | Description |
|------|-------------|
| `RankingColumnFields` | `"rank" \| "address" \| "points"`. |

### Hook

| Name | Description |
|------|-------------|
| `useRankingColumns` | Returns column config array filtered by `fields`; optional address and type. |

## useRankingColumns parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fields | RankingColumnFields[] | No | Which columns to include. |
| address | string | No | Current user address for "You". |
| enableSort | boolean | No | Enable sorting. |
| type | "general" \| "campaign" | No | Ranking type. |

## Usage example

```tsx
const columns = useRankingColumns(
  ["rank", "address", "points"],
  userAddress,
  false,
  "general"
);
```
