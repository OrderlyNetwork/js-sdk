# version.ts

## Overview

Sets and exports the package version. In browser environments it also attaches the version to `window.__ORDERLY_VERSION__["@orderly.network/trading-points"]`.

## Exports

| Name | Type | Description |
|------|------|-------------|
| default | string | Version string, e.g. `"1.1.1"` |

## Global augmentation

Extends `Window` with an optional `__ORDERLY_VERSION__` map of package names to version strings.

## Usage example

```typescript
import version from "./version";
console.log(version); // "1.1.1"
```
