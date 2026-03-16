# util.ts (ranking/shared)

## Overview

Small helpers for address comparison and row keys in ranking tables.

## Exports

### Functions

| Function | Description |
|----------|-------------|
| `isSameAddress(address1, address2)` | Returns true if addresses are equal (case-insensitive). |
| `getCurrentAddressRowKey(address)` | Returns `"current-address-${address.toLowerCase()}"` for marking "you" row. |

## Usage example

```typescript
import { isSameAddress, getCurrentAddressRowKey } from "./util";
if (isSameAddress(userAddress, row.address)) { ... }
const key = getCurrentAddressRowKey(userAddress);
```
