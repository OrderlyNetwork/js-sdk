# version.ts

## version.ts Responsibility

Exports the package version string for `@orderly.network/core` and, in browser, sets `window.__ORDERLY_VERSION__["@orderly.network/core"]` to that version for runtime checks.

## version.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| default | string | Version | Current package version (e.g. "2.10.2") |

## version.ts Behavior

- In browser (typeof window !== "undefined"): assigns `window.__ORDERLY_VERSION__["@orderly.network/core"] = "2.10.2"` (or current version).
- Default export is the version string.

## version.ts Example

```typescript
import version from "@orderly.network/core";
console.log(version); // "2.10.2"
// In browser: window.__ORDERLY_VERSION__?.["@orderly.network/core"]
```
