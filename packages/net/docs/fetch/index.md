# fetch

## Overview

HTTP client helpers built on `fetch`: `request` (internal), `get`, `post`, `put`, `del`, and `mutate`. Handles JSON request/response, default headers (e.g. `Content-Type`), and throws `ApiError` on 400 responses with message/code from the body.

## Exports

### `request`

Internal function that performs a single HTTP request.

- **Signature**: `async (url: string, options: RequestInit) => Promise<any>`
- **Behavior**: Validates URL scheme (must start with `http`), merges headers via `_createHeaders`, parses JSON response. On non-ok response, throws `ApiError` for status 400 (with `errorMsg.message` and `errorMsg.code`), otherwise throws `Error`.

### `get`

GET request with optional response formatter and standard success/data handling.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `url` | `string` | Yes | Request URL |
| `options` | `RequestInit` | No | Fetch options |
| `formatter` | `(data: any) => R` | No | Transform `res.data` before return |

- **Returns**: `Promise<R>`. If `res.success` is true, returns formatter result or `res.data.rows` if array, else `res.data`; otherwise throws.

### `post`

POST request with JSON body.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `url` | `string` | Yes | Request URL |
| `data` | `any` | Yes | Body (JSON.stringify'd) |
| `options` | `Omit<RequestInit, "method">` | No | Other fetch options |

- **Returns**: `Promise<any>` — parsed JSON response.

### `put`

PUT request with JSON body. Same parameter shape as `post` (url, data, options).

- **Returns**: `Promise<any>` — parsed JSON response.

### `del`

DELETE request.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `url` | `string` | Yes | Request URL |
| `options` | `Omit<RequestInit, "method">` | No | Other fetch options |

- **Returns**: `Promise<any>` — parsed JSON response.

### `mutate`

Generic request with full `RequestInit` (method and body are caller-defined).

- **Signature**: `async (url: string, init: RequestInit) => Promise<any>`
- **Returns**: Parsed JSON response.

## Usage example

```typescript
import { get, post, put, del, mutate, ApiError } from "@orderly.network/net";

const rows = await get("/api/v1/orders", undefined, (data) => data.rows);
await post("/api/v1/order", { symbol_id: "PERP_ETH", side: "BUY", order_type: "MARKET", order_quantity: 1 });
await put("/api/v1/order/123", { order_quantity: 2 });
await del("/api/v1/order/123");

try {
  await post("/api/...", data);
} catch (e) {
  if (e instanceof ApiError) console.log(e.code, e.message);
}
```
