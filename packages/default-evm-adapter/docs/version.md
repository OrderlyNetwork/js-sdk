# version

## Overview

Exports the package version string and optionally registers it on `window.__ORDERLY_VERSION__` for runtime version reporting when running in a browser.

## Exports

| Export     | Type     | Description |
| ---------- | -------- | ----------- |
| `default`  | `string` | Package version (e.g. `"2.9.1"`). |

## Behavior

- In a browser environment (`typeof window !== "undefined"`), sets `window.__ORDERLY_VERSION__["@orderly.network/default-evm-adapter"]` to the same version string, creating `__ORDERLY_VERSION__` if it does not exist.
- Does not mutate `window` in Node or other non-browser environments.

## Usage Example

```ts
import version from "@orderly.network/default-evm-adapter/version";
console.log(version); // "2.9.1"
```
