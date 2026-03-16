# constants.ts

## Overview

Defines shared string constants used by the net package (e.g. for API base URL configuration keys).

## Exports

### `__ORDERLY_API_URL_KEY__`

| Property | Type | Description |
| -------- | ---- | ----------- |
| Value | `string` | `"__ORDERLY_API_URL__"` — key used to resolve or store the Orderly API base URL |

## Usage example

```typescript
import { __ORDERLY_API_URL_KEY__ } from "@orderly.network/net";

// Use as a key for config or environment
const baseUrl = process.env[__ORDERLY_API_URL_KEY__] ?? "https://api.orderly.network";
```
