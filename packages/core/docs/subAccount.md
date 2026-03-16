# subAccount

> Location: `packages/core/src/subAccount.ts`

## Overview

Type definition for a sub-account: id, description, and holdings from API.

## Exports

### SubAccount (type)

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string | Sub-account ID. |
| description | string | User-defined description. |
| holding | API.Holding[] | Holdings from @orderly.network/types. |

## Usage Example

```ts
import type { SubAccount } from "@orderly.network/core";
const sub: SubAccount = {
  id: "0x...",
  description: "Trading",
  holding: [],
};
```
