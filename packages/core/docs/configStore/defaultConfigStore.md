# defaultConfigStore

> Location: `packages/core/src/configStore/defaultConfigStore.ts`

## Overview

Default implementation of `ConfigStore` with mainnet/testnet API URLs and operator URLs per chain namespace. Uses a Map and supports chain-namespace–scoped values for keys like `operatorUrl`.

## Exports

### URLS (type)

| Field | Type | Description |
| ----- | ---- | ----------- |
| apiBaseUrl | string | REST API base. |
| publicWsUrl | string | Public WebSocket. |
| privateWsUrl | string | Private WebSocket. |
| operatorUrl | Record\<ChainNamespaceType, string\> | Operator URL per chain. |

### API_URLS (constant)

Record\<NetworkId, URLS\> for `mainnet` and `testnet` (orderly.org and testnet endpoints).

### DefaultConfigStore (class)

Implements `ConfigStore`. Constructor: `(init: Partial\<Record\<ConfigKey, any\>\>)`. Defaults: env "prod", networkId "mainnet", brokerId "orderly", brokerName "Orderly", chainNamespace EVM. `get(key)` may return value for current chainNamespace when value is an object (e.g. operatorUrl). `clear()` throws.

## Usage Example

```ts
import { DefaultConfigStore, API_URLS } from "@orderly.network/core";
const store = new DefaultConfigStore({
  networkId: "testnet",
  brokerId: "my_broker",
});
const url = store.get("apiBaseUrl");
```
