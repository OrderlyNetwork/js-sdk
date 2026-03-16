# type.ts (assets)

## Overview

Types and constants for asset conversion and visibility.

## Exports

### Interfaces

| Name | Description |
|------|-------------|
| `ConvertedAssets` | `{ [asset: string]: number }` |
| `ConvertTransaction` | transaction_id, venue, converted_asset, received_asset, converted_qty, received_qty, haircut, chain_id?, tx_id?, result? |
| `ConvertRecord` | convert_id, converted_asset, received_asset, received_qty, type, status, created_time, updated_time, details |

### Types

- `ConvertType` — `"auto" \| "manual"`
- `ConvertStatus` — `"completed" \| "pending" \| "failed" \| "cancelled"`
- `VenueType` — `"on_chain" \| "internal_fund"`

### Constants

- `ORDERLY_ASSETS_VISIBLE_KEY` — localStorage key for visible assets.
