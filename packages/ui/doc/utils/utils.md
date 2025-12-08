# Utils Reference

> Location: `packages/ui/src/utils/*.ts`

## Overview

Utility modules expose helper functions used throughout the UI kit—string helpers, transition helpers, and wrappers around `tailwind-variants`. Import them when building your own components to stay consistent with built-in behavior.

## Source Structure

| File            | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `string.ts`     | String manipulation helpers (`capitalizeFirstLetter`).                  |
| `transition.ts` | View transition API wrapper (`startViewTransition`).                    |
| `tv.ts`         | Configured `tailwind-variants` instance with Orderly's prefix settings. |
| `index.ts`      | Re-exports `capitalizeFirstLetter` and `startViewTransition`.           |

## Exports & Types

### `capitalizeFirstLetter`

```typescript
function capitalizeFirstLetter(
  str: string,
  fallback?: string,
): undefined | string;
```

Capitalizes the first letter of a string. Returns `undefined` or the provided `fallback` if the input is `undefined` or `null`.

**Parameters:**

- `str: string` - The string to capitalize
- `fallback?: string` - Optional fallback value if `str` is undefined or null

**Returns:** `undefined | string` - The capitalized string, or fallback/undefined

**Example:**

```tsx
import { capitalizeFirstLetter } from "@veltodefi/ui";

capitalizeFirstLetter("hello"); // "Hello"
capitalizeFirstLetter(undefined, "default"); // "default"
capitalizeFirstLetter(null); // undefined
```

### `startViewTransition`

```typescript
function startViewTransition(callback: () => void): void;
```

Wraps the native `document.startViewTransition` API with a fallback for browsers that don't support it. If the API is available, it creates a smooth transition; otherwise, it executes the callback immediately.

**Parameters:**

- `callback: () => void` - Function to execute within the view transition

**Returns:** `void`

**Example:**

```tsx
import { startViewTransition } from "@veltodefi/ui";

startViewTransition(() => {
  // Update DOM state here
  setActiveTab("settings");
});
```

### `tv` (Internal)

```typescript
export const tv: ReturnType<typeof createTV>
```

Configured instance of `tailwind-variants` with Orderly's `oui-` prefix. This is used internally by components but can be imported directly if needed.

**Note:** This is not exported from `index.ts` but is available from the source file for internal use.

## Usage Examples

### String Formatting

```tsx
import { capitalizeFirstLetter } from "@veltodefi/ui";

function formatUserName(name: string | undefined) {
  return capitalizeFirstLetter(name, "Guest");
}
```

### View Transitions

```tsx
import { startViewTransition } from "@veltodefi/ui";

function handleTabChange(newTab: string) {
  startViewTransition(() => {
    setActiveTab(newTab);
    updateContent(newTab);
  });
}
```

## Implementation Notes

- `capitalizeFirstLetter` handles `null` and `undefined` gracefully, making it safe for optional data.
- `startViewTransition` provides progressive enhancement—it works in all browsers but only creates transitions where supported.
- The `tv` helper ensures consistent class merging across all components using `tailwind-variants`.

## Integration Tips

1. Use `capitalizeFirstLetter` for user-facing labels and display names to ensure consistent capitalization.
2. Wrap state updates in `startViewTransition` when changing layouts or content to provide smooth visual transitions.
3. Import utilities from `@veltodefi/ui` rather than internal paths to maintain compatibility with future refactors.
