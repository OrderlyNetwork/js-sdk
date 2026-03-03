# simpleDI

> Location: `packages/core/src/di/simpleDI.ts`

## Overview

Static facade for a global `Container` stored on global object under `__ORDERLY_CONTAINER__`. Provides register, get, getOr, and getAll for app-wide service resolution.

## Exports

### SimpleDI (class)

Static methods only (constructor private).

| Method | Description |
| ------ | ----------- |
| register(...serviceClasses) | Register classes (instantiated and added by name). |
| registerByName(name, serviceClass) | Register by name. |
| get\<T\>(name: string): T | Get service by name. |
| getOr\<T\>(name, instance): T | Get or register instance and return it. |
| getAll() | All registered services. |

## Usage Example

```ts
import { SimpleDI } from "@orderly.network/core";
SimpleDI.register(Account, ConfigStore);
const account = SimpleDI.get<Account>("account");
```
