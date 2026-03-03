# version

## Overview

Exposes the package version string and registers it on `window.__ORDERLY_VERSION__["@orderly.network/vaults"]` for runtime version reporting.

## Exports

- **Default export**: Version string (e.g. `"2.9.1"`).
- **Global**: In browser, sets `window.__ORDERLY_VERSION__["@orderly.network/vaults"] = "2.9.1"`.

## Usage example

```ts
import version from "@orderly.network/vaults/version";
console.log(version); // "2.9.1"
```
