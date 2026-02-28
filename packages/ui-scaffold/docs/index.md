# ui-scaffold

> Location: `packages/ui-scaffold/src`

## Overview

`ui-scaffold` provides the main layout and shell components for Orderly web applications: scaffold (desktop/mobile), top bar (MainNav), bottom nav, sidebar, footer, account menu, chain menu, sub-account UI, language switcher, QR scanner, and supporting widgets. It is built with TypeScript/React and integrates with `@orderly.network/hooks`, `@orderly.network/types`, and `@orderly.network/ui`.

## Directory structure

| Directory / file | Description |
| -----------------| ----------- |
| [components/](./components/index.md) | All UI components (scaffold, nav, footer, menus, etc.) |
| [utils/](./utils/index.md) | Utilities (e.g. chain support check) |
| [version.md](./version.md) | Package version and `window.__ORDERLY_VERSION__` |

## Package exports (from `index.ts`)

The package entry re-exports the following:

- **Layout**: `Scaffold`, `ScaffoldProps`, `useScaffoldContext`, `ScaffoldContext`
- **Navigation**: `MainNavWidget`, `MainNavWidgetProps`, `MainNavMobile`, `MainNavItem`, `BottomNavWidget`, `BottomNav`, `BottomNavProps`, `SideNavbarWidget`, `SideBar`, `SideBarProps`, `SideMenuItem`, `LeftNav*`
- **Menus & account**: `AccountMenuWidget`, `AccountSummaryWidget`, `ChainMenuWidget`, `ChainMenu`, `CampaignPositionEnum`
- **Sub-account**: All from `./components/subAccount`
- **Footer & tips**: All from `./components/footer`, `./components/maintenanceTips`
- **Restricted / offline**: All from `./components/restrictedInfo`
- **Other**: `MainLogo`, language switcher, scan QR code

## Root-level files

| File | Language | Description |
|------|----------|-------------|
| [version.md](./version.md) | TypeScript | Package version and global `__ORDERLY_VERSION__` |
| index.ts | TypeScript | Package barrel exports (see above) |

## Links

- [Components index](./components/index.md)
- [Utils index](./utils/index.md)
