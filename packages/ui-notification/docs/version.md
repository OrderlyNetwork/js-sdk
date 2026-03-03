# version

## Overview

Registers the package version on `window.__ORDERLY_VERSION__` for the `@orderly.network/ui-notification` key and exports the version string as default.

## Exports

### Default export

- **Type**: `string`
- **Value**: `"2.9.1"` (or current package version)

## Global augmentation

Extends `Window` with:

```ts
interface Window {
  __ORDERLY_VERSION__?: {
    [key: string]: string;
  };
}
```

When running in a browser, sets `window.__ORDERLY_VERSION__["@orderly.network/ui-notification"]` to the package version.

## Usage example

```typescript
import version from "@orderly.network/ui-notification/version";
// or from the package entry that re-exports it
console.log(version); // "2.9.1"
```
