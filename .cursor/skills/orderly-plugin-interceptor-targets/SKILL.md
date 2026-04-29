---
name: orderly-plugin-interceptor-targets
description: Standardizes how to create and expose Orderly Plugin Interceptor Targets with typed props, injectable wiring, and package entry registration. Use when adding a new interceptor target, refactoring a component to be interceptable, or wiring InterceptorTargetPropsMap module augmentation.
---

# Orderly Plugin Interceptor Targets

Create interceptor targets in a repeatable way so plugin authors get typed `createInterceptor(...)` props and stable target paths.

## When to Use

- User asks to add a new interceptor target to a component.
- User asks to refactor existing UI into an interceptable target.
- User asks to expose typed target props via `InterceptorTargetPropsMap`.
- User asks to make plugin usage possible without deep imports.

## Canonical Workflow

1. Define target props type near the component.
   - Keep props minimal and stable.
   - Export the props type if plugin consumers need it.

2. Define a target path constant and wrap default renderer with `injectable`.
   - Use one constant string source of truth.
   - Keep default behavior unchanged when no plugin intercepts it.

3. Add module augmentation in `interceptorTargets.ts`.
   - Map target path to props type in `InterceptorTargetPropsMap`.
   - Add `/// <reference types="@orderly.network/plugin-core" />` when needed by TS resolution.

4. Wire side-effect import in package entry `index.ts`.
   - `import "./interceptorTargets";`
   - This ensures typed `createInterceptor(...)` works when users import the package.

5. Optionally re-export target constants and types in package entry.
   - Improves plugin DX by avoiding deep imports.

6. Validate.
   - Run lints/type checks for changed files.
   - Verify default UI behavior still works with no plugin installed.

## Naming Conventions

- Target path format: `Domain.Component.Slot` (example: `TradingView.DisplayControl.DesktopMenuList`).
- Prefer deterministic naming; avoid temporary or environment-specific suffixes.
- Keep target path string identical in:
  - injectable target constant,
  - module augmentation key,
  - plugin interceptor usage.

## Copy-Ready Templates

### 1) Target Props + Injectable Wrapper

```tsx
import { injectable } from "@orderly.network/ui";

export type TargetProps = {
  items: Array<{ id: string; label: string }>;
};

export const SomeTarget = "Domain.Component.Slot";

const BaseTargetComponent: React.FC<TargetProps> = (props) => {
  return <div>{/* default rendering */}</div>;
};

export const InjectableTargetComponent = injectable<TargetProps>(
  BaseTargetComponent,
  SomeTarget,
);
```

### 2) `interceptorTargets.ts` Module Augmentation

```ts
/// <reference types="@orderly.network/plugin-core" />
import type { TargetProps } from "./path/to/component";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Domain.Component.Slot": TargetProps;
  }
}
```

### 3) Package Entry Side-Effect Import

```ts
/**
 * Side-effect: augment InterceptorTargetPropsMap for typed interceptor props.
 */
import "./interceptorTargets";
```

### 4) Plugin Usage (Typed `createInterceptor`)

```tsx
import { createInterceptor } from "@orderly.network/plugin-core";
import { SomeTarget } from "@orderly.network/your-package";

createInterceptor(SomeTarget, (Original, props) => {
  return <Original {...props} />;
});
```

## Anti-Patterns

- Missing `import "./interceptorTargets"` in package `index.ts`.
- Different string values between target constant and augmentation key.
- Calling React Hooks directly in interceptor outer callback:
  - `component: (Original, props) => { useXxx(); ... }` is invalid.
  - If Hooks are needed, return an inner React component and call Hooks there.
- Replacing default behavior unintentionally when only extension was intended.

## Validation Checklist

- [ ] Target path constant is exported and reused (no duplicated string literals).
- [ ] `interceptorTargets.ts` maps the exact target path to exact props type.
- [ ] Package entry includes side-effect import for augmentation.
- [ ] Plugin can use `createInterceptor(Target, ...)` with typed `props`.
- [ ] Default UI behavior matches pre-refactor behavior when no interceptor is installed.
- [ ] Lints/type checks pass on touched files.

## Reference Patterns In Repo

- `packages/ui-transfer/src/components/depositAndWithdraw/interceptorTargets.ts`
- `packages/ui-transfer/src/components/depositAndWithdraw/index.tsx`
- `packages/ui-scaffold/src/interceptorTargets.ts`
- `packages/ui-order-entry/src/index.ts`
- `packages/ui-tradingview/src/interceptorTargets.ts`
- `packages/ui-tradingview/src/components/displayControl/displayControl.desktop.tsx`
