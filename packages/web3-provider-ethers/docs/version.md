# version

## Overview

Defines the package version and registers it on `window.__ORDERLY_VERSION__` for the `@orderly.network/web3-provider-ethers` key when running in a browser. Used for version reporting and debugging.

## Exports

### Default export: version string

- **Type**: `string`
- **Value**: `"2.9.1"` (at doc generation time).

## Global augmentation

When `window` is defined (browser), the module:

1. Ensures `window.__ORDERLY_VERSION__` is an object (creates `{}` if missing).
2. Sets `window.__ORDERLY_VERSION__["@orderly.network/web3-provider-ethers"]` to the same version string.

### Type declaration

```typescript
declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
```

## Usage example

```typescript
import version from "@orderly.network/web3-provider-ethers/version";

console.log(version); // "2.9.1"

// In browser:
// window.__ORDERLY_VERSION__["@orderly.network/web3-provider-ethers"] === "2.9.1"
```
