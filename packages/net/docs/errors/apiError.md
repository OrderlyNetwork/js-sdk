# errors/apiError.ts

## Overview

Custom error class for API failures. Extends `Error` and adds a numeric `code` property, typically set from the API response body (e.g. on 400 responses).

## Exports

### `ApiError`

Class extending `Error`.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `name` | `string` | `"ApiError"` |
| `message` | `string` | Error message (from constructor) |
| `code` | `number` | API error code (readonly, from constructor) |

#### Constructor

- **Signature**: `new ApiError(message: string, code: number)`

## Usage example

```typescript
import { ApiError } from "@orderly.network/net";

try {
  await post("/api/...", data);
} catch (e) {
  if (e instanceof ApiError) {
    console.error(e.message, e.code);
  }
}
```
