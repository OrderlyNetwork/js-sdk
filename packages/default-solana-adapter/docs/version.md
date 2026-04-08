# version.ts

## version.ts responsibility

Exports the package version string and, in browser environments, attaches it to `window.__ORDERLY_VERSION__["@orderly.network/default-solana-adapter"]` for runtime version inspection.

## version.ts exports

| Name | Type | Role | Description |
|------|------|------|--------------|
| default | string | Version | Package version, e.g. "2.10.2" |

## version.ts execution flow

1. If `typeof window !== "undefined"`, set or extend `window.__ORDERLY_VERSION__` and assign the version under key `"@orderly.network/default-solana-adapter"`.
2. Export the same version string as default.

## version.ts Example

```typescript
import version from "@orderly.network/default-solana-adapter/version";
// or from package entry
console.log(version); // "2.10.2"
// In browser: window.__ORDERLY_VERSION__["@orderly.network/default-solana-adapter"] === "2.10.2"
```
