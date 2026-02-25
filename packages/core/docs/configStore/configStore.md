# configStore

> Location: `packages/core/src/configStore/configStore.ts`

## Overview

Configuration key type and store interface used across core for API URLs, broker id, network, env, and chain namespace.

## Exports

### ConfigKey (type)

Union of: `"apiBaseUrl"` | `"klineDataUrl"` | `"privateWsUrl"` | `"publicWsUrl"` | `"operatorUrl"` | `"domain"` | `"brokerId"` | `"brokerName"` | `"networkId"` | `"env"` | `"chainNamespace"` | `"PROD_URL"` | `"orderly_markets"` | `"markets"`.

### ConfigStore (interface)

| Method | Description |
| ------ | ----------- |
| get\<T\>(key: ConfigKey): T | Get value for key. |
| getOr\<T\>(key: ConfigKey, defaultValue: T): T | Get value or default. |
| set\<T\>(key: ConfigKey, value: T): void | Set value. |
| clear(): void | Clear store. |

## Usage Example

```ts
import type { ConfigStore, ConfigKey } from "@orderly.network/core";
const baseUrl = configStore.get<string>("apiBaseUrl");
const broker = configStore.getOr("brokerId", "orderly");
```
