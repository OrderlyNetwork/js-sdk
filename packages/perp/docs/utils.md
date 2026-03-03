# utils

## Overview

Utility functions for Decimal math used across perp calculations.

## Exports

### DMax

Returns the maximum value among the given Decimal or number values (similar to `Math.max` but for Decimal instances).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `...values` | `(Decimal \| number)[]` | Yes | One or more values to compare. |

**Returns**: `Decimal` — The maximum value as a Decimal instance.

**Throws**: `Error` if no arguments are provided.

## Usage example

```typescript
import { DMax } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";

const a = new Decimal(10);
const b = 20;
const c = new Decimal(15);
const max = DMax(a, b, c); // Decimal(20)
```
