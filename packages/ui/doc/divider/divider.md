# Divider Reference

> Location: `packages/ui/src/divider/divider.tsx`, `packages/ui/src/divider/index.ts`

## Overview

`Divider` draws horizontal or vertical separators to provide visual grouping inside lists, cards, and settings panels. It supports configurable intensity (line color), style (solid/dashed/dotted), and spacing tokens.

## Source Structure

| File          | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `divider.tsx` | Declares `dividerVariants`, `Divider` component, and `DividerProps`. |
| `index.ts`    | Re-exports `Divider`, `dividerVariants`, and `DividerProps`.         |

## Exports & Types

### `Divider`

```typescript
const Divider: React.ForwardRefExoticComponent<
  DividerProps & React.RefAttributes<HTMLDivElement>
>
```

Divider separator component.

### `dividerVariants`

```typescript
const dividerVariants: ReturnType<typeof tv>
```

Tailwind variants for divider styling.

### `DividerProps`

```typescript
type DividerProps = VariantProps<typeof dividerVariants> &
  React.HTMLAttributes<HTMLDivElement>;
```

Extends `div` props with divider-specific variant props.

## Props & Behavior

### Divider Props

#### `direction`

```typescript
direction?: "horizontal" | "vertical"
```

Divider direction. `"horizontal"` applies `border-b`; `"vertical"` applies `border-l`. Default: `"horizontal"`.

#### `intensity`

```typescript
intensity?: 4 | 6 | 8 | 12 | 16
```

Line color intensity mapping to `border-line-*` tokens for different contrast levels. Default: `4`.

#### `lineStyle`

```typescript
lineStyle?: "dashed" | "dotted"
```

Line style. `undefined` renders solid line. Options: `"dashed"` or `"dotted"`.

#### `mx`

```typescript
mx?: 2 | 4 | 6 | 8 | 10
```

Horizontal margin (left and right).

#### `my`

```typescript
my?: 2 | 4 | 6 | 8 | 10
```

Vertical margin (top and bottom).

#### `className`

```typescript
className?: string
```

Additional overrides (e.g., `oui-border-white/10` on dark surfaces).

## Usage Examples

### Horizontal Divider

```tsx
import { Divider } from "@veltodefi/ui";

<section>
  <SectionHeader />
  <Divider intensity={6} className="oui-my-6" />
  <SectionBody />
</section>;
```

### Vertical Divider

```tsx
import { Divider, Flex, Button } from "@veltodefi/ui";

<Flex itemAlign="center" gap={3}>
  <Button variant="text">Bid</Button>
  <Divider direction="vertical" intensity={8} className="oui-h-6" />
  <Button variant="text">Ask</Button>
</Flex>;
```

### Dashed Divider

```tsx
import { Divider } from "@veltodefi/ui";

<Divider lineStyle="dashed" intensity={6} my={4} />;
```

### Dotted Divider

```tsx
import { Divider } from "@veltodefi/ui";

<Divider lineStyle="dotted" intensity={8} mx={4} />;
```

### With Spacing

```tsx
import { Divider } from "@veltodefi/ui";

<Divider intensity={12} mx={6} my={8} />;
```

## Implementation Notes

- Divider uses `pointer-events-none` to prevent interaction
- `box-content` ensures borders don't affect layout calculations
- Intensity values map to design tokens: `4` (lightest) to `16` (darkest)
- Horizontal dividers use `border-b`, vertical dividers use `border-l`

## Integration Tips

1. Place text between two dividers using `Flex` to create "OR" separators while keeping spacing consistent.
2. Customize `lineStyle` for expandable sections (dashed) or warnings (dotted).
3. Combine `intensity` with theme-specific classes to maintain sufficient contrast on both light and dark surfaces.
4. Use `mx` and `my` props for quick spacing instead of wrapping in containers with margins.
5. For vertical dividers, set explicit height via `className` to control the divider length.
