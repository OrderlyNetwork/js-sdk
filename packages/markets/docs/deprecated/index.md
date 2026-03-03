# deprecated

Legacy components kept for backward compatibility. Prefer the non-deprecated components under `components/` and `pages/` when building new features.

## Subdirectories

| Path | Description |
|------|-------------|
| **recentList** | Recent markets list (widget, ui, script, index) |
| **newListingList** | New listing markets list (widget, ui, script, index) |
| **favoritesList** | Favorites list (widget, ui, script, index) |
| **dataTable** | Old data table with `useSort` (index, useSort) |

## Note

These modules are still re-exported from the package root (`index.ts`) but may be removed in a future major version. Use `MarketsListFull`, `FavoritesListFull`, and the shared `useSort`/column helpers from `components/` instead where possible.
