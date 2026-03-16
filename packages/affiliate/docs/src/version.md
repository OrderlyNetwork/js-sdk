# version.ts

## Overview

Sets the package version on `window.__ORDERLY_VERSION__["@orderly.network/affiliate"]` when running in a browser, and exports the version string as default.

## Exports

- **default** – Version string (e.g. `"2.8.14"`).

## Usage Example

```ts
import version from "@orderly.network/affiliate/version";
// or from built entry
console.log(version); // "2.8.14"
```
