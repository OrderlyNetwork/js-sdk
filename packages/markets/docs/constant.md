# constant.ts

## Overview

Constants used for persisting side-markets UI state in storage (e.g. localStorage).

## Exports

| Name | Description |
|------|-------------|
| `SIDE_MARKETS_TAB_SORT_STORAGE_KEY` | Key for storing side markets tab sort preference (`"orderly_side_markets_tab_sort"`) |
| `SIDE_MARKETS_SEL_TAB_KEY` | Key for storing selected side markets tab (`"orderly_side_markets_sel_tab_key"`) |

## Usage example

```typescript
import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY, SIDE_MARKETS_SEL_TAB_KEY } from "@orderly.network/markets";

localStorage.setItem(SIDE_MARKETS_SEL_TAB_KEY, "favorites");
```
