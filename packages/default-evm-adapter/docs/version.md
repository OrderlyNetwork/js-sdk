# version.ts

## version.ts Responsibility

Exposes the default-evm-adapter package version as a string and registers it on the global `window.__ORDERLY_VERSION__` object in browser environments so other Orderly packages can detect the installed adapter version.

## version.ts Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| default | string | Version | Package version string (e.g. `"2.10.2"`) |

## version.ts Input and Output

- **Input**: None.
- **Output**: Default export is the version string; side effect in browser: `window.__ORDERLY_VERSION__["@orderly.network/default-evm-adapter"]` is set.

## version.ts Global Augmentation

- **Global**: Extends `Window` with optional `__ORDERLY_VERSION__?: { [key: string]: string }`.
- **Side effect**: When `typeof window !== "undefined"`, assigns the current version to `window.__ORDERLY_VERSION__["@orderly.network/default-evm-adapter"]`.

## version.ts Dependencies and Callers

- **Upstream**: None.
- **Downstream**: Package entry (`index.ts`) and any code that reads `window.__ORDERLY_VERSION__`.

## version.ts Example

```typescript
import version from "@orderly.network/default-evm-adapter";

console.log(version); // "2.10.2"

// In browser, after import:
// window.__ORDERLY_VERSION__["@orderly.network/default-evm-adapter"] === "2.10.2"
```
