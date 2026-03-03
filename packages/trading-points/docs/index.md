# trading-points (src)

Overview of the `@orderly.network/trading-points` package source. This module provides the Trading Points / campaign points UI: stages, rankings, leaderboard, countdown, FAQ, and user statistics.

## Directory structure

| Directory | Description |
|-----------|-------------|
| [pages](./pages/index.md) | Point system pages (points) |
| [components](./components/index.md) | Ranking and leaderboard components |
| [hooks](./hooks/index.md) | usePointsData, useEndReached, PointsProvider / usePoints |

## Root files

| File | Language | Description | Link |
|------|----------|-------------|------|
| entry (index.ts) | TypeScript | Barrel export for point system page | [entry.md](./entry.md) |
| version.ts | TypeScript | Package version and `window.__ORDERLY_VERSION__` | [version.md](./version.md) |
| utils.ts | TypeScript | Date range, campaign week split, formatting helpers | [utils.md](./utils.md) |
| type.ts | TypeScript | DateRange, LeaderboardTab | [type.md](./type.md) |
| typing.d.ts | TypeScript | Module declaration for `*.png` | [typing.md](./typing.md) |
