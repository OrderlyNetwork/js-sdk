# version.ts

## Overview

Exposes the package version string and optionally attaches it to `window.__ORDERLY_VERSION__` in browser environments for debugging or multi-package version reporting.

## Exports

### Default export

- **Type**: `string`
- **Value**: `"2.9.1"` (current package version)

### Global (browser only)

When running in a browser (`typeof window !== "undefined"`), assigns:

- `window.__ORDERLY_VERSION__["@orderly.network/net"] = "2.9.1"`

## Usage example

```typescript
import version from "@orderly.network/net/version";
// or
import { version } from "@orderly.network/net";

console.log(version); // "2.9.1"

// In browser:
// window.__ORDERLY_VERSION__?.["@orderly.network/net"] === "2.9.1"
```
