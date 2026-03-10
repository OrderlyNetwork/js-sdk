# version

## Overview

Exposes the `@orderly.network/trading` package version and registers it on `window.__ORDERLY_VERSION__` in the browser for runtime version reporting.

## Exports

### Default export

- **Type**: `string`
- **Value**: `"2.9.1"` (current package version)

### Global

- In browser environments, sets `window.__ORDERLY_VERSION__["@orderly.network/trading"]` to the same version string.

## Usage example

```typescript
import version from "@orderly.network/trading/version";
// or from package entry if re-exported
console.log(version); // "2.9.1"
```
