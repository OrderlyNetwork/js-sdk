# Badge Reference

> Location: `packages/ui/src/badge/badge.tsx`

## Overview

`Badge` renders compact pill-like indicators for status, tags, or metrics. The component relies on `tailwind-variants`, combining `variant`, `color`, and `size` to keep visual language in sync across tables, buttons, and navigation items.

## Source Structure

| File        | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `badge.tsx` | Declares `badgeVariants`, the `Badge` component, and `BadgeProps`. |

## Exports & Types

### `Badge`

```typescript
const Badge: (props: BadgeProps) => JSX.Element
```

Primary badge component for status indicators and tags.

### `badgeVariants`

```typescript
const badgeVariants: ReturnType<typeof tv>
```

Tailwind variants function for badge styling. Useful when composing other components.

### `BadgeProps`

```typescript
interface BadgeProps
  extends ComponentPropsWithout<"div", RemovedProps>,
    VariantProps<typeof badgeVariants> {}
```

Extends `div` props with badge-specific variant props.

## Props & Behavior

### Badge Props

#### `variant`

```typescript
variant?: "contained" | "text"
```

Badge style variant. `"contained"` renders a filled background; `"text"` renders text-only with semantic color. Default: `"contained"`.

#### `color`

```typescript
color?: "primary" | "primaryLight" | "secondary" | "success" | "buy" | "danger" | "sell" | "warning" | "neutral"
```

Semantic color palette. Compound variants map each to the correct background/text combination. Default: `"primary"`.

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg"
```

Badge size. Controls height, padding, and font size. `xs` is fixed at 18px tall for dense layouts. Default: `"md"`.

#### `className`

```typescript
className?: string
```

Additional Tailwind classes (e.g., `oui-uppercase`, `oui-tracking-wide`).

## Usage Examples

### Basic Badges

```tsx
import { Badge } from "@veltodefi/ui";

<Badge color="buy" size="sm">Long</Badge>

<Badge variant="text" color="neutral" className="oui-uppercase">
  Pending
</Badge>
```

### Status Badges

```tsx
import { Badge } from "@veltodefi/ui";

<Badge color="success">Filled</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="danger">Cancelled</Badge>
```

### Trade Badges

```tsx
import { Badge } from "@veltodefi/ui";

<Badge color="buy">Buy</Badge>
<Badge color="sell">Sell</Badge>
```

### Size Variants

```tsx
import { Badge } from "@veltodefi/ui";

<Badge size="xs">XS</Badge>
<Badge size="sm">SM</Badge>
<Badge size="md">MD</Badge>
<Badge size="lg">LG</Badge>
```

## Implementation Notes

- Base classes (`oui-inline-flex`, `oui-items-center`) keep icons and text aligned; drop an `Icon` child without extra wrappers
- `focus:oui-ring-ring` ensures focus visibility if badges become interactive (`tabIndex={0}`)
- Compound variants ensure proper color combinations for each variant type
- `xs` size is optimized for dense layouts with fixed 18px height

## Integration Tips

1. Map workflow states to `color` values via a helper (e.g., `status === "FILLED" ? "success" : "warning"`) to keep semantics consistent across tables and cards.
2. For clickable badges, wrap them in a `button` or set `role="button"` + `onClick` to satisfy accessibility expectations.
3. Pair long or localized labels with a `Tooltip` to avoid layout shifts inside tight containers like Toolbars or Tab bars.
4. Use `variant="text"` for subtle status indicators that don't need background emphasis.
5. Combine with `Flex` and icons to create rich status indicators with visual hierarchy.
