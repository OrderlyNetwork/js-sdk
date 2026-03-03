# version.ts

> Location: `packages/ui-leverage/src/version.ts`

## Overview

Defines the package version and injects it into `window.__ORDERLY_VERSION__["@orderly.network/ui-leverage"]` for runtime version reporting. Only runs in browser (`typeof window !== "undefined"`).

## Exports

| Name | Type | Description |
|------|------|-------------|
| `default` | `string` | Version string, e.g. `"2.9.1"` |

## Global augmentation

Extends `Window` with optional:

```ts
window.__ORDERLY_VERSION__?: { [key: string]: string };
```

After load, `window.__ORDERLY_VERSION__["@orderly.network/ui-leverage"]` is set to the package version.

## Usage example

```typescript
import pkgVersion from "@orderly.network/ui-leverage/version";
console.log(pkgVersion); // "2.9.1"
```
