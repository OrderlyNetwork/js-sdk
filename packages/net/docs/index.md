# @orderly.network/net

## Overview

This package provides network utilities for the Orderly ecosystem: HTTP client (get/post/put/delete), WebSocket client with public/private streams, version info, and shared constants.

## Directory structure

| Directory | Description |
| --------- | ----------- |
| [types](./types/index.md) | WebSocket-related types and interfaces |
| [errors](./errors/index.md) | API error class |
| [fetch](./fetch/index.md) | HTTP request helpers |
| [ws](./ws/index.md) | WebSocket client and handlers |

## Top-level files

| File | Language | Description | Link |
| ---- | -------- | ----------- | ---- |
| `index.ts` | TypeScript | Package entry; re-exports version, fetch, constants, WS | (this file) |
| `version.ts` | TypeScript | Package version and global `__ORDERLY_VERSION__` | [version.md](./version.md) |
| `constants.ts` | TypeScript | API URL key constant | [constants.md](./constants.md) |
| `sum.ts` | TypeScript | Utility `sum(a, b)` | [sum.md](./sum.md) |
| `sum.test.ts` | TypeScript | Tests for `sum` | [sum.test.md](./sum.test.md) |

## Package entry (index.ts)

Re-exports:

- `version` (default) from `./version`
- `get`, `post`, `del`, `put`, `mutate` from `./fetch`
- `__ORDERLY_API_URL_KEY__` from `./constants`
- `WS`, `WebSocketEvent` from `./ws/ws`

## Usage example

```typescript
import { get, post, WS, WebSocketEvent, version, __ORDERLY_API_URL_KEY__ } from "@orderly.network/net";

const data = await get("/api/v1/...");
await post("/api/v1/...", { key: "value" });

const ws = new WS({ privateUrl: "...", publicUrl: "...", accountId: "..." });
ws.on("status:change", (e) => console.log(e));
```
