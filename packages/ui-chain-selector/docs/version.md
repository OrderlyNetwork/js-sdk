# version.ts

## Overview

Provides the package version string and registers it on `window.__ORDERLY_VERSION__["@orderly.network/ui-chain-selector"]` when running in a browser. Used for version reporting and debugging.

## Exports

### Default export

- **Type**: `string`
- **Value**: `"2.9.1"` (current package version)

## Global augmentation

Extends the `Window` interface so TypeScript recognizes:

```ts
window.__ORDERLY_VERSION__?: {
  [key: string]: string;
};
```

At runtime, the script sets `window.__ORDERLY_VERSION__["@orderly.network/ui-chain-selector"] = "2.9.1"` when `window` is defined.

## Usage example

```typescript
import version from "@orderly.network/ui-chain-selector/version";
// version === "2.9.1"

// In browser:
// window.__ORDERLY_VERSION__["@orderly.network/ui-chain-selector"] === "2.9.1"
```
