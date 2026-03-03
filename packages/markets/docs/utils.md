# utils.ts

## Overview

Utility functions and hooks for sorting, paging, symbol search, and window dimensions. Used by markets lists and tables.

## Exports

### Functions

| Function | Description |
|----------|-------------|
| `getPagedData(list, pageSize, pageIndex)` | Returns the slice of `list` for the given page (1-based index). |
| `sortList(list, sort?)` | Sorts `list` by `sort.sortKey` and `sort.sortOrder` (asc/desc); uses smart comparison (numbers, dates, strings). |
| `searchBySymbol(list, searchValue?, formatString?)` | Filters and ranks list by symbol/displayName match: exact match first, then starts-with, then other; each group sorted alphabetically. |

### Hooks

| Hook | Description |
|------|-------------|
| `useSort(initialSort?, onSortChange?)` | Returns `{ sort, onSort, getSortedList }` for table sort state and applying sort to a list. |
| `useSize()` | Returns `{ width, height }` of the window, updated on resize. |

## Parameters

- **getPagedData**: `list` (array), `pageSize` (number), `pageIndex` (1-based number).
- **sortList**: `list` (array), optional `sort` (`SortType`).
- **searchBySymbol**: `list` (array of items with `symbol` and optional `displayName`), `searchValue` (string), optional `formatString` for `formatSymbol`.
- **useSort**: optional `initialSort`, optional `onSortChange(sort?)`.

## Usage example

```typescript
import { getPagedData, sortList, searchBySymbol, useSort, useSize } from "@orderly.network/markets";

const page = getPagedData(allRows, 20, 1);
const sorted = sortList(rows, { sortKey: "volume", sortOrder: "desc" });
const filtered = searchBySymbol(markets, "PERP", "PERP_");
const { sort, onSort, getSortedList } = useSort(undefined, (s) => setSort(s));
const { width, height } = useSize();
```
