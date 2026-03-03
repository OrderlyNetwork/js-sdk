# app

> Location: `packages/core/src/app.ts`

## Overview

Minimal `App` class that tracks a prepare list (`symbolInfo`, `clientInfo`) and provides `updateState(name)` to remove items from it. Used for readiness/state coordination.

## Exports

### App (class)

- **updateState(name: string)** – Removes `name` from internal `prepare` array.

## Usage Example

```ts
const app = new App();
app.updateState("symbolInfo");
```
