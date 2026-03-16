# account

## Overview

Default scope for the Orderly key. Used when adding or validating Orderly API key permissions.

## Exports

### DEFAUL_ORDERLY_KEY_SCOPE

- **Type:** `string`
- **Value:** `"read,trading"`

Default scope string for the Orderly key (read and trading permissions).

## Usage example

```typescript
import { DEFAUL_ORDERLY_KEY_SCOPE } from "@orderly.network/types";
addOrderlyKey({ scope: DEFAUL_ORDERLY_KEY_SCOPE, ... });
```
