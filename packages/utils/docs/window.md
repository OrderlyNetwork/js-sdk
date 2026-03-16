# window

## Overview

Safe browser/Node utilities: run a callback only when `window` exists, get the global object across environments, and get current timestamp (with optional offset from `__ORDERLY_timestamp_offset`).

## Exports

### windowGuard

Runs the given callback only when `window` is defined (e.g. in browser). No-op in Node.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cb | Function | Yes | Callback to run in window environment |

---

### getGlobalObject

Returns the global object (`globalThis`, `self`, `window`, or `global`). Throws if none is available.

**Returns:** `typeof globalThis` (or equivalent).

---

### getTimestamp

Returns current time in ms. In browser, if `getGlobalObject().__ORDERLY_timestamp_offset` is a number, returns `Date.now() + offset`; otherwise returns `Date.now()`.

**Returns:** `number` — milliseconds.

## Usage example

```typescript
import { windowGuard, getGlobalObject, getTimestamp } from "@orderly.network/utils";

windowGuard(() => {
  console.log(window.__ORDERLY_VERSION__);
});

const g = getGlobalObject();
const ts = getTimestamp();
```
