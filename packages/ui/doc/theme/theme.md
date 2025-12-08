# Theme Reference

> Location: `packages/ui/src/theme/theme.ts`

## Overview

`theme.ts` centralizes Orderly's design tokens—colors, spacing, typography, radius, shadows, etc. Both the Tailwind plugin and runtime theme context consume this object, ensuring consistent values between CSS and JavaScript.

## Source Structure

| File       | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `theme.ts` | Defines the `Theme` type and theme object with design tokens. |

## Exports & Types

### `Theme`

```typescript
type Theme = {
  rounded: {};
  gaps: {
    grid: number;
  };
  components: {
    toast: {} & ToastOptions;
  };
};
```

Theme type definition for design tokens.

### Theme Object

The theme object is exported and contains:

- `rounded`: Border radius tokens
- `gaps`: Spacing tokens (e.g., `grid: 4`)
- `components`: Component-specific theme overrides (e.g., `toast`)

## Usage Examples

### Importing Theme

```ts
import theme from "@veltodefi/ui/theme";

console.log(theme.gaps.grid); // 4
```

### Using Theme in Components

```tsx
import theme from "@veltodefi/ui/theme";

function CustomComponent() {
  const gridGap = theme.gaps.grid;

  return <div style={{ gap: `${gridGap * 4}px` }}>{/* Content */}</div>;
}
```

### Extending Theme

```tsx
import { OrderlyThemeProvider } from "@veltodefi/ui";
import theme from "@veltodefi/ui/theme";

const customTheme = {
  ...theme,
  gaps: {
    ...theme.gaps,
    grid: 8, // Override grid gap
  },
};

<OrderlyThemeProvider theme={customTheme}>
  <App />
</OrderlyThemeProvider>;
```

## Implementation Notes

- Theme tokens are consumed by both Tailwind plugins and runtime context
- Values map directly to Tailwind theme tokens
- Modifying theme values flows through to all components automatically
- Theme is a TypeScript type for compile-time safety

## Integration Tips

1. When customizing the UI kit, extend this theme object and pass it to `OrderlyThemeProvider` so component variants and Tailwind utilities remain aligned.
2. Keep token names stable; changing keys can break variant lookups in components.
3. Version-control theme overrides separately to track divergences from upstream tokens.
4. Use theme values in custom components to maintain consistency with the design system.
5. Access theme at runtime via `useOrderlyTheme` hook for dynamic theming.
