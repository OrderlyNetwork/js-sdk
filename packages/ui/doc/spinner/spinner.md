# Spinner Reference

> Location: `packages/ui/src/spinner/spinner.tsx`

## Overview

`Spinner` provides lightweight loading indicators sized and colored according to the design system. Use it inside buttons, empty states, or standalone loading screens.

## Source Structure

| File          | Description                                               |
| ------------- | --------------------------------------------------------- |
| `spinner.tsx` | Declares `Spinner`, `SpinnerProps`, and variant mappings. |
| `index.ts`    | Re-exports `Spinner`.                                     |

## Exports & Types

### `Spinner`

```typescript
const Spinner: React.FC<SpinnerProps>
```

Loading indicator component with size and color variants.

### `SpinnerProps`

```typescript
interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
  className?: string;
}
```

## Props & Behavior

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg"
```

Spinner diameter and stroke width. Default varies by usage context.

#### `color`

```typescript
color?: string
```

Spinner color. Can use semantic palette (primary, success, danger, neutral, etc.) or custom color classes.

#### `className`

```typescript
className?: string
```

Additional classes for layout tweaks (e.g., margins, animation speed).

**Note:** Component renders SVG-based loader ensuring crisp scaling.

## Usage

```tsx
import { Spinner } from "@orderly.network/ui";

<div className="oui-flex oui-items-center oui-gap-2">
  <Spinner size="sm" />
  Loading orders…
</div>;
```

## Integration Tips

1. Place `Spinner` inside buttons for async actions—wrap text and spinner in a `Flex` container to maintain spacing.
2. Combine with `EmptyView` to show “Loading…” placeholders before data resolves.
3. Adjust color via `className="oui-text-white"` when placing spinners on dark backgrounds.
