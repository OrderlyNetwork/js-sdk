# container

> Location: `packages/core/src/di/container.ts`

## Overview

Simple dependency injection container: register services by class (auto-named by constructor name) or by name, resolve by name, get all. Used by `SimpleDI`.

## Exports

### Container (class)

Constructor: `(providers?: any[], services?: Record\<string, any\>)`.

| Method | Description |
| ------ | ----------- |
| register(...serviceClasses) | Instantiate (if function) and add by constructor name; lowercase alias. |
| registerByName(name, serviceClass) | Instantiate (if function) and add by name; lowercase alias. |
| get\<T\>(name: string): T | Get service by name. |
| getAll() | Shallow copy of all services. |

Internal: add/addByName, inject, injectIntoProperties for property injection (not exposed publicly in typical use).

## Usage Example

```ts
import Container from "@orderly.network/core/di/container";
const c = new Container();
c.register(MyService);
const s = c.get<MyService>("MyService");
```
