# keyStore

> Location: `packages/core/src/keyStore.ts`

## Overview

Storage for orderly keys and account metadata per address: interface `OrderlyKeyStore`, abstract `BaseKeyStore`, `LocalStorageStore` (browser), and `MockKeyStore` (testing).

## Exports

### OrderlyKeyStore (interface)

| Method | Description |
| ------ | ----------- |
| getOrderlyKey(address?) | Get orderly key for address or default. |
| getAccountId(address) | Get stored account ID. |
| setAccountId(address, accountId) | Store account ID. |
| getAddress() / setAddress(address) / removeAddress() | Current wallet address. |
| generateKey() | Create new OrderlyKeyPair. |
| setKey(orderlyKey, secretKey) | Store key for address (second arg is OrderlyKeyPair). |
| cleanKey(address, key) | Remove one key (e.g. "orderlyKey"). |
| cleanAllKey(address) | Remove all keys for address. |

### BaseKeyStore (abstract class)

Constructor: `(networkId?: string)` (default "testnet"). Defines key prefix `orderly_${networkId}_`. All methods abstract except keyPrefix.

### LocalStorageStore (class)

Extends `BaseKeyStore`. Persists keys and accountId in localStorage under key prefix + address.

### MockKeyStore (class)

Implements `OrderlyKeyStore`. Constructor: `(secretKey: string)`. Always returns same key from getOrderlyKey/generateKey; other methods no-op. For tests.

## Usage Example

```ts
import { LocalStorageStore, MockKeyStore } from "@orderly.network/core";
const keyStore = new LocalStorageStore("mainnet");
keyStore.setAddress("0x...");
keyStore.setKey("0x...", keyPair);
const key = keyStore.getOrderlyKey();
```
