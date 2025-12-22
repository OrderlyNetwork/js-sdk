# Toast Reference

> Location: `packages/ui/src/toast/Toaster.tsx`, `packages/ui/src/toast/toastTile.tsx`, `packages/ui/src/toast/index.ts`

## Overview

Toast utilities wrap `react-hot-toast` to provide branded containers (`Toaster`) and toast content (`ToastTile`). The package also re-exports `toast` directly from `react-hot-toast` so product code uses a single import source.

## Source Structure

| File            | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `Toaster.tsx`   | Configures global toast container (position, theme, class overrides).  |
| `toastTile.tsx` | Card-style toast body with optional icon, title, description, actions. |
| `index.ts`      | Re-exports `Toaster`, `ToastTile`, and `toast` from `react-hot-toast`. |

## Exports & Types

### `Toaster`

```typescript
const Toaster: React.FC<ToastProps>
```

Global toast container component that configures toast appearance and behavior.

### `ToastTile`

```typescript
const ToastTile: (props: ToastTileProps) => JSX.Element
```

Card-style toast body component with title and optional subtitle.

### `toast`

```typescript
const toast: typeof import("react-hot-toast").toast
```

Re-exported from `react-hot-toast` for creating and managing toasts.

### `ToastProps`

```typescript
interface ToastProps extends ToastOptions {}
```

Extends `react-hot-toast` `ToastOptions` with Orderly-specific configuration.

### `ToastTileProps`

```typescript
interface ToastTileProps {
  title: string;
  subtitle?: string;
  classNames?: {
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
  };
}
```

## Props & Behavior

### Toaster Props

Inherits all `react-hot-toast` `Toaster` props:

#### `position`

```typescript
position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
```

Toast position. Default: `"top-right"`.

#### `reverseOrder`

```typescript
reverseOrder?: boolean
```

Reverse the order of toasts.

#### `toastOptions`

```typescript
toastOptions?: ToastOptions
```

Default options for all toasts. Orderly provides defaults for `success`, `error`, `loading`, and `custom` variants.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

### ToastTile Props

#### `title` (required)

```typescript
title: string;
```

Toast title text.

#### `subtitle`

```typescript
subtitle?: string
```

Optional subtitle text.

#### `classNames`

```typescript
classNames?: {
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}
```

Class name overrides for toast tile components.

## Usage Examples

### Basic Toast

```tsx
import { Toaster, toast } from "@orderly.network/ui";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <button onClick={() => toast.success("Order placed!")}>Show Toast</button>
    </>
  );
}
```

### Custom Toast with ToastTile

```tsx
import { Toaster, toast, ToastTile } from "@orderly.network/ui";

const notify = () =>
  toast.custom((t) => (
    <ToastTile
      title="Order placed"
      subtitle="#123456"
      classNames={{
        className: "oui-bg-success/10",
        titleClassName: "oui-text-success",
      }}
    />
  ));

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <button onClick={notify}>Notify</button>
    </>
  );
}
```

### Toast Variants

```tsx
import { toast } from "@orderly.network/ui";

toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
toast("Default message");
```

### Toast with Promise

```tsx
import { toast } from "@orderly.network/ui";

const promise = fetchData();

toast.promise(promise, {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load data",
});
```

## Implementation Notes

- `Toaster` configures default styles for `success`, `error`, `loading`, and `custom` toast types
- Default duration is 3000ms for success/error, 5000ms for loading/custom
- Toast container is positioned at `top-[62px]` on mobile and `top-[80px]` on desktop
- `ToastTile` uses `Flex` with `direction="column"` for title/subtitle layout
- Icons are automatically added for success, error, and loading states

## Integration Tips

1. Use `toast.custom` with `ToastTile` for rich layouts (icons, CTA buttons) while still letting `react-hot-toast` manage stacking.
2. Expose a shared `Toaster` high in the tree (once) so nested components do not spawn multiple containers.
3. For SSR, render `Toaster` client-side only if `window` checks are needed, otherwise the component handles hydration gracefully.
4. Use `toast.promise` for async operations to automatically show loading, success, and error states.
5. Customize toast appearance via `toastOptions` in `Toaster` or per-toast via `toast()` options.
