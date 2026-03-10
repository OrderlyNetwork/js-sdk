# additionalInfoRepository

> Location: `packages/core/src/additionalInfoRepository.ts`

## Overview

Thin wrapper around a `Repository` for saving and reading wallet additional info (e.g. wallet name, AGW address) keyed by wallet address.

## Exports

### AdditionalInfoRepository (class)

Constructor: `(repository: Repository)`.

| Method | Description |
| ------ | ----------- |
| save(address, data) | Merge data for address. |
| getAll(address) | Get all data for address. |
| get(address, key) | Get one key. |
| clear(address) | Remove all data for address. |
| remove(address, key) | Remove one key. |

## Usage Example

```ts
const repo = new AdditionalInfoRepository(new LocalStorageRepository("wallet_extra"));
repo.save("0x...", { AGWAddress: "0x..." });
const info = repo.getAll("0x...");
```
