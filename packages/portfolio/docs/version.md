# version.ts

## Overview

Exposes the package version on `window.__ORDERLY_VERSION__["@orderly.network/portfolio"]` and as default export for build-time or runtime use.

## Exports

- **Default export**: string version (e.g. `"2.9.1"`).

## Global augmentation

Extends `Window` with:

```ts
interface Window {
  __ORDERLY_VERSION__?: { [key: string]: string };
}
```

## Usage example

```ts
import version from "@orderly.network/portfolio/version";
// or
// window.__ORDERLY_VERSION__?.["@orderly.network/portfolio"]
```
