# type.ts

## Overview

Defines shared types and enums used across the markets package: favorite instance type, sort configuration, column getter type, and tab identifiers for markets and funding views.

## Exports

### Types

| Name | Description |
|------|-------------|
| `FavoriteInstance` | Return type of `useMarkets()[1]` from `@orderly.network/hooks` |
| `SortType` | `{ sortKey: string; sortOrder: SortOrder }` for table/list sorting |
| `GetColumns` | Function type `(favorite, isFavoriteList) => Column[]` for dynamic column definitions |

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `MarketsPageTab` | `Markets`, `Funding` | Top-level page tabs (markets list vs funding) |
| `MarketsTabName` | `Favorites`, `Recent`, `All`, `Rwa`, `NewListing` | Markets sub-tab names |
| `FundingTabName` | `Overview`, `Comparison` | Funding sub-tab names |

## Usage example

```typescript
import { MarketsPageTab, MarketsTabName, SortType, type GetColumns } from "@orderly.network/markets";

const tab = MarketsPageTab.Markets;
const sort: SortType = { sortKey: "volume", sortOrder: "desc" };
```
