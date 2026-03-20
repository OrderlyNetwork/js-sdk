# version.ts

## Responsibility of version.ts

Exports the package version string and attaches it to `window.__ORDERLY_VERSION__["@orderly.network/affiliate"]` in browser for runtime version reporting.

## Exports

| Name | Type | Role | Description |
|------|------|------|-------------|
| default | string | Version | Semver string, e.g. "2.10.2" |

## Input and Output

- **Input**: None.
- **Output**: Version string; side effect: sets `window.__ORDERLY_VERSION__` when `window` is defined.

## Dependencies

- None.

## version.ts Example

```typescript
import version from "@orderly.network/affiliate/version";
// version === "2.10.2"

// In browser: window.__ORDERLY_VERSION__?.["@orderly.network/affiliate"] === "2.10.2"
```
