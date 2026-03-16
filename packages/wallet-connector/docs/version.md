# version.ts

## Overview

Registers the package version on `window.__ORDERLY_VERSION__` in browser environments and exports the version string. Used for diagnostics and version reporting across Orderly SDK packages.

## Exports

### Default export

**Type:** `string`  
**Value:** `"2.9.1"` (matches package.json).

## Global augmentation

Declares a global `Window` interface extension:

```ts
interface Window {
  __ORDERLY_VERSION__?: {
    [key: string]: string;
  };
}
```

When running in a browser, sets `window.__ORDERLY_VERSION__["@orderly.network/wallet-connector"] = "2.9.1"` (or merges into existing object).

## Usage example

```ts
import version from "@orderly.network/wallet-connector/version";

console.log(version); // "2.9.1"

// In browser:
// window.__ORDERLY_VERSION__?.["@orderly.network/wallet-connector"] === "2.9.1"
```
