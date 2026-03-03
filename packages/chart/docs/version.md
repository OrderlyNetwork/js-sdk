# version

## Overview

Sets the package version on `window.__ORDERLY_VERSION__["@orderly.network/chart"]` when running in a browser, and exports the version string as default.

## Exports

- **Default**: `"2.9.1"` (string).

## Global extension

| Global | Description |
|--------|-------------|
| `Window.__ORDERLY_VERSION__` | Optional record of package names to version strings; this file sets the key `@orderly.network/chart`. |

## Usage example

```ts
import version from "@orderly.network/chart/src/version";
// version === "2.9.1"
// In browser: window.__ORDERLY_VERSION__?.["@orderly.network/chart"] === "2.9.1"
```
