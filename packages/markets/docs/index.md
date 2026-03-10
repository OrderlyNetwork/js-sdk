# Markets Package (src)

Overview of the `@orderly.network/markets` package source. This directory contains the markets UI, data lists, funding views, and shared types/utilities.

## Directory structure

| Directory | Description |
|-----------|-------------|
| [components](./components/index.md) | Reusable markets UI components (symbol info bar, lists, sheets, tabs, etc.) |
| [pages](./pages/index.md) | Page-level components (Markets home, header, data list, funding) |
| [deprecated](./deprecated/index.md) | Deprecated components (recent list, new listing, favorites list, data table) |

## Top-level files

| File | Language | Description | Link |
|------|----------|-------------|------|
| `index.ts` | TypeScript | Package public exports (pages, components, types) | [index-file.md](./index-file.md) |
| `type.ts` | TypeScript | Shared types and enums (FavoriteInstance, SortType, MarketsPageTab, etc.) | [type.md](./type.md) |
| `constant.ts` | TypeScript | Storage keys and constants for side markets | [constant.md](./constant.md) |
| `version.ts` | TypeScript | Package version and global `__ORDERLY_VERSION__` registration | [version.md](./version.md) |
| `utils.ts` | TypeScript | Sorting, paging, search and window size utilities | [utils.md](./utils.md) |
| `icons.tsx` | React/TSX | SVG icon components used across markets UI | [icons.md](./icons.md) |
