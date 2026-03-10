# constants

## Overview

Default orderbook tick sizes, symbol depths, and display names for specific symbols.

## Exports

| Name | Type | Description |
|------|------|-------------|
| `DEFAULT_TICK_SIZES` | `Record<PropertyKey, string>` | Default tick sizes (e.g. PERP_BTC_USDC: "1") |
| `DEFAULT_SYMBOL_DEPTHS` | `Record<PropertyKey, number[]>` | Default depth levels per symbol |
| `DEFAULT_SYMBOL_DISPLAY_NAMES` | `Record<string, string>` | Display names (e.g. XAU/XAG) |

## Usage example

```ts
import { DEFAULT_TICK_SIZES, DEFAULT_SYMBOL_DEPTHS } from "@orderly.network/hooks";
const tick = DEFAULT_TICK_SIZES["PERP_BTC_USDC"]; // "1"
```
