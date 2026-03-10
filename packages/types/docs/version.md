# version

## Overview

Exports the package version string and optionally registers it on `window.__ORDERLY_VERSION__["@orderly.network/types"]` in browser environments.

## Exports

### Default export

- **version** (`string`) – Current package version, e.g. `"2.9.1"`.

### Global (browser only)

When running in a browser, the module sets `window.__ORDERLY_VERSION__["@orderly.network/types"]` to the same version string.

## Usage example

```typescript
import version from "@orderly.network/types/version";
console.log(version); // "2.9.1"
```
