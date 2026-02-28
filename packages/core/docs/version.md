# version

> Location: `packages/core/src/version.ts`

## Overview

Sets package version on `window.__ORDERLY_VERSION__["@orderly.network/core"]` in browser and exports default version string.

## Exports

- **default** – Version string (e.g. `"2.9.1"`).
- **window.__ORDERLY_VERSION__** – In browser, object mapping package names to versions; this file sets the core package entry.

## Usage Example

```ts
import version from "@orderly.network/core/version";
// or read window.__ORDERLY_VERSION__["@orderly.network/core"]
```
