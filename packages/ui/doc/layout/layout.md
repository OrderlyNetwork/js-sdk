# Layout Module Reference

> Location: `packages/ui/src/layout/*.ts(x)`

## Overview

Layout modules centralize design tokens for spacing, decoration, intensity, and positioning. Components reuse these `tailwind-variants` definitions to avoid duplicating logic and to keep themes aligned.

## Source Structure

| File            | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `layout.tsx`    | Base layout variants composed by Box/Flex.                                |
| `gap.tsx`       | Declares `gap`, `gapX`, `gapY` tokens (`gapVariants`).                    |
| `decoration.ts` | Border, radius, gradient, and background variants (`decorationVariants`). |
| `position.tsx`  | Positioning helpers (`absolute`, offsets, z-index) (`positionVariants`).  |
| `shadow.tsx`    | Shadow/glow intensity definitions (`shadowVariants`).                     |
| `visible.ts`    | Visibility toggles (`visible`, `invisible`) (`visibleVariants`).          |
| `intensity.ts`  | Color intensity helpers (line colors, overlays).                          |

## Exports & Types

### `gapVariants`

```typescript
const gapVariants: {
  variants: {
    gap: { 0: string; 1: string; 2: string; ... };
    gapX: { 0: string; 1: string; 2: string; ... };
    gapY: { 0: string; 1: string; 2: string; ... };
  };
}
```

Gap spacing variants for flex/grid layouts.

### `decorationVariants`

```typescript
const decorationVariants: {
  variants: {
    border: { true: string };
    r: { none: string; sm: string; base: string; md: string; lg: string; xl: string; "2xl": string; full: string };
    gradient: { primary: string; secondary: string; brand: string; success: string; warning: string; danger: string; neutral: string };
    intensity: { 100: string; 200: string; ... 900: string };
    borderColor: { 4: string; 6: string; 8: string; 12: string; 16: string };
  };
}
```

Decoration variants for borders, radius, gradients, and backgrounds.

### `positionVariants`

```typescript
const positionVariants: ReturnType<typeof tv>
```

Position variants for absolute/relative positioning and offsets.

### `shadowVariants`

```typescript
const shadowVariants: ReturnType<typeof tv>
```

Shadow variants for elevation and depth.

### `visibleVariants`

```typescript
const visibleVariants: ReturnType<typeof tv>
```

Visibility variants for show/hide states.

## Variant Details

### Gap Variants

- `gap`: 0, 1, 2, 3, 4, 5, 6, 8, 10
- `gapX`: Horizontal gap (same values)
- `gapY`: Vertical gap (same values)

### Decoration Variants

- `border`: Boolean (true = border)
- `r`: Border radius (`none`, `sm`, `base`, `md`, `lg`, `xl`, `2xl`, `full`)
- `gradient`: Gradient colors (`primary`, `secondary`, `brand`, `success`, `warning`, `danger`, `neutral`)
- `intensity`: Background intensity (100-900)
- `borderColor`: Border color intensity (4, 6, 8, 12, 16)

## Usage Examples

### Using Gap Variants

```tsx
import { gapVariants } from "@orderly.network/ui/layout";

const myVariants = tv({
  extend: gapVariants,
  base: "oui-flex",
  variants: {
    // Additional variants
  },
});
```

### Using Decoration Variants

```tsx
import { decorationVariants } from "@orderly.network/ui/layout";

const cardVariants = tv({
  extend: decorationVariants,
  base: "oui-card",
  variants: {
    // Additional variants
  },
});
```

### Composing Variants

```tsx
import { gapVariants, decorationVariants } from "@orderly.network/ui/layout";
import { tv } from "@orderly.network/ui/utils";

const containerVariants = tv({
  extend: [gapVariants, decorationVariants],
  base: "oui-container",
  variants: {
    // Additional variants
  },
});
```

## Implementation Notes

- Variants are composable—components can extend multiple variant objects
- Values map directly to Tailwind theme tokens
- Modifying layout variants affects all components that use them
- Responsive syntax is supported for many variants
- Variant naming is normalized for consistency

## Integration Tips

1. When introducing a new design token (e.g., `borderStyle`), add it here so every component can opt-in consistently.
2. Keep variant naming normalized (`shadow`, `border`, `position`) to simplify prop naming in consumer components.
3. Review tree-shaking impact when expanding variants—each new option increases generated CSS classes.
4. Use `extend` in `tv()` to compose multiple variant objects.
5. Access variants directly when building custom components to maintain design system consistency.
