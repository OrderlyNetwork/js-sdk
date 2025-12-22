# Provider Reference

> Location: `packages/ui/src/provider/componentProvider.tsx`, `packages/ui/src/provider/orderlyThemeContext.tsx`, `packages/ui/src/provider/orderlyThemeProvider.tsx`

## Overview

Providers manage shared configuration across the UI kit. `OrderlyThemeProvider` supplies theme tokens (colors, spacing, typography), while `ComponentProvider` enables component overrides for white-labeling.

## Source Structure

| File                       | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `orderlyThemeContext.tsx`  | Declares context and `useOrderlyTheme` hook.       |
| `orderlyThemeProvider.tsx` | Implements the theme provider component.           |
| `componentProvider.tsx`    | Allows overriding internal components via context. |

## Exports & Types

### `OrderlyThemeProvider`

```typescript
const OrderlyThemeProvider: React.FC<PropsWithChildren<OrderlyThemeProviderProps>>
```

Theme provider component that supplies theme tokens and component overrides.

### `useOrderlyTheme`

```typescript
function useOrderlyTheme(): OrderlyThemeContextState;
```

Hook for accessing theme context and component theme overrides.

### `OrderlyThemeProviderProps`

```typescript
type OrderlyThemeProviderProps = {
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
  overrides?: Partial<ComponentOverrides>;
};
```

### `OrderlyThemeContextState`

```typescript
interface OrderlyThemeContextState {
  getComponentTheme: <T extends keyof ComponentOverrides>(
    component: T,
    defaultValue?: ComponentOverrides[T],
  ) => ComponentOverrides[T] | undefined;
}
```

### `ComponentOverrides`

```typescript
interface ComponentOverrides {
  [component: string]: {
    variant?: string;
    [key: string]: unknown;
  };
}
```

## Props & Behavior

### OrderlyThemeProvider Props

#### `components`

```typescript
components?: {
  [position in ExtensionPosition]: ComponentType;
}
```

Component overrides for extension positions.

#### `overrides`

```typescript
overrides?: Partial<ComponentOverrides>
```

Component theme overrides. Allows customizing component variants.

## Usage Examples

### Basic Theme Provider

```tsx
import { OrderlyThemeProvider } from "@orderly.network/ui";

<OrderlyThemeProvider>
  <App />
</OrderlyThemeProvider>;
```

### Theme Provider with Overrides

```tsx
import { OrderlyThemeProvider } from "@orderly.network/ui";

<OrderlyThemeProvider
  overrides={{
    tabs: { variant: "contained" },
    button: { variant: "outlined" },
  }}
>
  <App />
</OrderlyThemeProvider>;
```

### Using useOrderlyTheme

```tsx
import { useOrderlyTheme } from "@orderly.network/ui";

function CustomComponent() {
  const { getComponentTheme } = useOrderlyTheme();
  const tabsTheme = getComponentTheme("tabs", { variant: "default" });

  return <Tabs variant={tabsTheme?.variant} />;
}
```

## Implementation Notes

- `OrderlyThemeProvider` wraps both `OrderlyThemeContext` and `ComponentsProvider`
- Component overrides are resolved via `getComponentTheme` function
- Default values can be provided when getting component themes
- Theme context is memoized to prevent unnecessary re-renders

## Integration Tips

1. Persist user-selected themes (dark/light) and call `setTheme` to update tokens at runtime.
2. Use `ComponentProvider` to inject branding-specific components (logos, empty states) without forking the UI kit.
3. Wrap providers near the app root to ensure all components, including modals rendered via portals, can access the context.
4. Use `overrides` to customize component variants globally without modifying individual component instances.
5. Combine with `ExtensionProvider` for plugin-based component overrides.
