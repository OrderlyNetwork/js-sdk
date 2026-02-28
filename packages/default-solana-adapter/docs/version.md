# version

## Overview

Exposes the package version string and registers it on `window.__ORDERLY_VERSION__` in browser environments so the app can report which version of `@orderly.network/default-solana-adapter` is loaded.

## Exports

### Default export

- **Type:** `string`
- **Value:** `"2.9.1"` (matches `package.json` version)

When running in a browser, the module also sets:

- `window.__ORDERLY_VERSION__["@orderly.network/default-solana-adapter"] = "2.9.1"`

## Usage Example

```ts
import version from "@orderly.network/default-solana-adapter";

console.log(version); // "2.9.1"
// In browser: window.__ORDERLY_VERSION__["@orderly.network/default-solana-adapter"] === "2.9.1"
```
