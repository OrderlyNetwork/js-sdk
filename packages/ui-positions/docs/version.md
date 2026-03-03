# version

## Overview

Exposes the package version and injects it into `window.__ORDERLY_VERSION__["@orderly.network/ui-positions"]` for runtime checks. Default export is the version string (e.g. `"2.9.1"`).

## Exports

### Default export

- **Type**: `string`
- **Description**: Current package version.

### Global augmentation

- **`Window.__ORDERLY_VERSION__`**: Optional record of package names to version strings; this package sets `["@orderly.network/ui-positions"]`.

## Usage example

```typescript
import version from "@orderly.network/ui-positions/version";
// or from source
import version from "./version";
console.log(version); // "2.9.1"
```
