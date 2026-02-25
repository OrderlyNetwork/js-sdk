# icons.tsx

## Overview

React SVG icon components used across the markets package. All accept standard `SVGProps<SVGSVGElement>` (e.g. `className`, `width`, `height`). Most use `currentColor` for fill.

## Exports (components)

| Component | Description |
|-----------|-------------|
| `EditIcon` | Pencil/edit icon (16×16) |
| `TrashIcon` | Trash bin (16×16) |
| `AllMarketsIcon` | Bar chart style “all markets” (12×12) |
| `NewListingsIcon` | New listings / lightbulb style (12×12) |
| `FavoritesIcon` / `UnFavoritesIcon` | Star filled / outline (20×21) |
| `FavoritesIcon2` / `UnFavoritesIcon2` | Alternate star icons (12×13) |
| `CirclePlusIcon` | Circle with plus (18×18) |
| `SearchIcon` | Magnifier (14×14) |
| `MoveToTopIcon` | Move to top arrow (20×21) |
| `OrderlyIcon` | Orderly logo mark (12×13) |
| `TopIcon` | Top/arrow up (16×17) |
| `DeleteIcon` | X/delete (16×17) |
| `AddIcon` / `ActiveAddIcon` | Plus; ActiveAddIcon uses brand gradient |
| `ExpandIcon` / `CollapseIcon` | Expand/collapse arrows (16×16) |
| `FilterIcon` | Filter (18×18) |
| `TriangleDownIcon` | Chevron down (12×12) |
| `ArrowLeftIcon` / `ArrowRightIcon` | Left/right arrows (16×16) |
| `SortingIcon` / `AscendingIcon` / `DescendingIcon` | Table sort indicators (10×10) |

## Usage example

```tsx
import { SearchIcon, FavoritesIcon } from "@orderly.network/markets";

<SearchIcon className="w-4 h-4" />
<FavoritesIcon />
```
