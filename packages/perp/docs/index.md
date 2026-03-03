# @orderly.network/perp

## Overview

Perpetual (perp) calculation utilities for Orderly Network. This package provides functions and types for account valuation, collateral, margin, positions, orders, and liquidation-related calculations.

## Directory

All source files live under `packages/perp/src` (flat structure, no subdirectories).

## Files

| File | Language | Description |
|------|----------|-------------|
| [entry.md](./entry.md) | TypeScript | Main entry point; re-exports `version`, `positions`, `account`, `orderUtils`, and `order`. |
| [version.md](./version.md) | TypeScript | Package version constant and `window.__ORDERLY_VERSION__` registration. |
| [constants.md](./constants.md) | TypeScript | Shared constants (e.g. `IMRFactorPower`). |
| [utils.md](./utils.md) | TypeScript | Decimal helper `DMax`. |
| [account.md](./account.md) | TypeScript | Account and collateral calculations: total value, free collateral, IMR, max qty, margin ratio, MMR, LTV, withdrawal limits, etc. |
| [order.md](./order.md) | TypeScript | Order-related: price bounds, scope price, order fee, estimated liquidation price, leverage, TP/SL ROI. |
| [positions.md](./positions.md) | TypeScript | Position notional, unrealized PnL, liquidation price, MMR, TP/SL estimates, max position notional/leverage. |

## Quick links

- **Entry**: [entry.md](./entry.md)
- **Version & constants**: [version.md](./version.md), [constants.md](./constants.md)
- **Utils**: [utils.md](./utils.md)
- **Account & margin**: [account.md](./account.md)
- **Orders**: [order.md](./order.md)
- **Positions**: [positions.md](./positions.md)
