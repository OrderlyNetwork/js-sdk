# version

## Overview

Sets the package version on `window.__ORDERLY_VERSION__["@orderly.network/ui-orders"]` for runtime checks and exports the version string as default.

## Exports

- **Default export**: Version string (e.g. `"2.9.1"`).

## Global

- Extends `Window` with `__ORDERLY_VERSION__?: { [key: string]: string }` and assigns the current package version when running in a browser.

## Usage example

```typescript
import pkgVersion from "@orderly.network/ui-orders/version";
// or
const version = window.__ORDERLY_VERSION__?.["@orderly.network/ui-orders"];
```
