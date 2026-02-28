# fetcher

## Overview

HTTP fetcher used by SWR-based hooks. Wraps `@orderly.network/net` `get` with optional response formatter. Also exports `useQueryOptions` type and `noCacheConfig` for SWR.

## Exports

### `fetcher(url, init?, queryOptions?)`

Calls `get(url, init, queryOptions?.formatter)`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | Full URL |
| `init` | `RequestInit` | Fetch init (optional) |
| `queryOptions` | `useQueryOptions<any>` | Optional formatter and SWR config |

### `useQueryOptions<T>`

`SWRConfiguration & { formatter?: (data: any) => T }`.

### `noCacheConfig`

`SWRConfiguration` with `dedupingInterval: 0`, `revalidateOnMount: true`, `revalidateIfStale: true`.

## Usage example

```ts
import { fetcher, noCacheConfig, type useQueryOptions } from "@orderly.network/hooks";
```
