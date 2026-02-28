# components

Reusable markets UI components: symbol info bars, market lists/sheets, tabs, funding views, search, and shared hooks.

## Subdirectories and main files

| Path | Description | Link |
|------|-------------|------|
| **symbolDisplay** | `symbolDisplay.tsx` – Displays symbol with optional token icon and display name | [symbolDisplay.md](./symbolDisplay.md) |
| **marketsProvider** | Context provider for symbol, search, comparison props | [marketsProvider/index.md](./marketsProvider/index.md) |
| **symbolInfoBar** | Compact symbol info bar (script, ui, widget) | [symbolInfoBar/index.md](./symbolInfoBar/index.md) |
| **symbolInfoBarFull** | Full symbol info bar with more data (script, ui, widget, rwaTooltip, dataItem) | [symbolInfoBarFull/index.md](./symbolInfoBarFull/index.md) |
| **subMenuMarkets** | Sub-menu for markets tabs (Favorites, Recent, All, etc.) | [subMenuMarkets/index.md](./subMenuMarkets/index.md) |
| **sideMarkets** | Side panel markets list (columns, script, ui, widget) | [sideMarkets/index.md](./sideMarkets/index.md) |
| **marketsSheet** | Sheet/drawer style markets list | [marketsSheet/index.md](./marketsSheet/index.md) |
| **marketsList** | Generic markets list (script, ui, widget) | [marketsList/index.md](./marketsList/index.md) |
| **marketsListFull** | Full markets list with columns and types | [marketsListFull/index.md](./marketsListFull/index.md) |
| **horizontalMarkets** | Horizontal market type filter and market items | [horizontalMarkets/index.md](./horizontalMarkets/index.md) |
| **dropDownMarkets** | Dropdown markets selector | [dropDownMarkets/](./dropDownMarkets/) |
| **expandMarkets** / **collapseMarkets** | Expand/collapse markets UI | [expandMarkets/](./expandMarkets/), [collapseMarkets/](./collapseMarkets/) |
| **favoritesTabs** | Favorites tab UI and script | [favoritesTabs/index.md](./favoritesTabs/index.md) |
| **favoritesListFull** | Full favorites list widget | [favoritesListFull/](./favoritesListFull/) |
| **fundingRateHint** | Funding rate hint component | [fundingRateHint/index.md](./fundingRateHint/index.md) |
| **fundingOverview** | Funding overview table (desktop/mobile) | [fundingOverview/index.md](./fundingOverview/index.md) |
| **fundingComparison** | Funding comparison across exchanges | [fundingComparison/index.md](./fundingComparison/index.md) |
| **searchInput** | Search input for symbols | [searchInput/index.md](./searchInput/index.md) |
| **shared** | Shared column helpers and hooks (`getSymbolColumn`, `useTabSort`, `useFavoritesExtraProps`) | [shared/](./shared/) |
| **rwaTab** / **rwaDotTooltip** | RWA tab and tooltip | [rwaTab.md](./rwaTab.md), [rwaDotTooltip.md](./rwaDotTooltip.md) |

## Column modules

- `column.tsx` in **marketsSheet**, **dropDownMarkets**, **sideMarkets**, **markersListFull**, **shared**: define table columns for respective lists.
- **fundingOverview** / **fundingComparison**: `columns.tsx` for funding tables.
