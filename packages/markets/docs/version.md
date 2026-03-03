# version.ts

## Overview

Registers the package version on `window.__ORDERLY_VERSION__["@orderly.network/markets"]` for runtime version reporting. Only runs in browser environments.

## Exports

| Name | Description |
|------|-------------|
| `default` | String version (e.g. `"2.9.1"`) |

## Usage example

```typescript
import version from "@orderly.network/markets/version";
// or via window.__ORDERLY_VERSION__["@orderly.network/markets"]
```
