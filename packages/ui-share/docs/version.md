# version

## Overview

Sets and exports the package version for `@orderly.network/ui-share`. In browser environments it also attaches the version to `window.__ORDERLY_VERSION__` for runtime version reporting.

## Exports

### Default export

- **Type**: `string`
- **Value**: `"2.9.1"` (current package version)

## Global augmentation

Extends the `Window` interface:

```ts
interface Window {
  __ORDERLY_VERSION__?: {
    [key: string]: string;
  };
}
```

In browser: `window.__ORDERLY_VERSION__["@orderly.network/ui-share"] = "2.9.1"`.

## Usage example

```typescript
import version from "@orderly.network/ui-share/version";
// or from the package entry if re-exported
console.log(version); // "2.9.1"
```
