# version

## Overview

Registers the package version on `window.__ORDERLY_VERSION__["@orderly.network/trading-rewards"]` when running in a browser, and exports the version string as default.

## Exports

- **Default**: `"2.9.1"` (string).

## Global augmentation

Extends `Window` with:

```typescript
interface Window {
  __ORDERLY_VERSION__?: { [key: string]: string };
}
```

## Usage example

```typescript
import version from "@orderly.network/trading-rewards/version";
// version === "2.9.1"
// In browser: window.__ORDERLY_VERSION__?.["@orderly.network/trading-rewards"] === "2.9.1"
```
