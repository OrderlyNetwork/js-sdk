# repository

> Location: `packages/core/src/repository.ts`

## Overview

Generic key-value storage interface and `LocalStorageRepository` implementation keyed by address. Used for wallet additional info and similar per-address data.

## Exports

### Repository (interface)

| Method | Description |
| ------ | ----------- |
| save(address, data) | Merge and save data for address. |
| getAll(address) | Get all data for address. |
| get(address, key) | Get one key for address. |
| clear(address) | Remove all data for address. |
| update(address, key, data) | Set one key. |
| remove(address, key) | Remove one key. |

### LocalStorageRepository (class)

Constructor: `(name: string)` – storage key name. Persists to localStorage under `name` as JSON; structure is `{ [address]: { ...keys } }`. Methods no-op when localStorage is unavailable (e.g. non-browser).

## Usage Example

```ts
import { LocalStorageRepository } from "@orderly.network/core";
const repo = new LocalStorageRepository("my_app_data");
repo.save("0x...", { theme: "dark" });
const all = repo.getAll("0x...");
```
