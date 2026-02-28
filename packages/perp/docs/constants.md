# constants

## Overview

Shared constants used in perp margin and IMR calculations.

## Exports

### IMRFactorPower

| Property | Type | Description |
|----------|------|-------------|
| Value | `number` | Power of the IMR factor in margin formulas; default `4 / 5` (0.8). |

Used in IMR/MMR formulas such as `IMR_Factor * |notional|^IMRFactorPower`.

## Usage example

```typescript
import { IMRFactorPower } from "@orderly.network/perp";

// IMRFactorPower === 4/5
const power = IMRFactorPower;
```
