# Grid Reference

> Location: `packages/ui/src/grid/grid.tsx`, `packages/ui/src/grid/span.tsx`, `packages/ui/src/grid/index.ts`

## Overview

`Grid` extends `Box` with CSS Grid controls for columns, rows, flow, and gaps. It is used for dashboards, settings panels, and responsive layouts requiring more control than Flexbox. `Grid.Span` (or the exported `Span` component) simplifies column/row spanning.

## Source Structure

| File       | Description                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `grid.tsx` | Declares `gridVariants`, `Grid` component, and `GridProps`.                                           |
| `span.tsx` | Exports `Span` component with `colSpan` and `rowSpan` props, plus `SpanProps` and `gridSpanVariants`. |
| `index.ts` | Re-exports `Grid` and `gridVariants`, and attaches `Span` as `Grid.span`.                             |

## Exports & Types

### `Grid`

```typescript
const Grid: React.ForwardRefExoticComponent<
  GridProps & React.RefAttributes<HTMLDivElement>
> & {
  span: typeof Span;
}
```

CSS Grid container component. Also exposes `Grid.span` as a static property for convenience.

### `gridVariants`

```typescript
const gridVariants: ReturnType<typeof tv>
```

Tailwind variants function for grid styling.

### `GridProps`

```typescript
interface GridProps extends BoxProps, VariantProps<typeof gridVariants> {}
```

Extends `BoxProps` with grid-specific variant props.

### `Span`

```typescript
const Span: (props: SpanProps) => JSX.Element
```

Grid item component for controlling column and row spans. Must be a child of a `Grid` component.

### `SpanProps`

```typescript
interface SpanProps extends BoxProps, VariantProps<typeof gridSpanVariants> {}
```

Props for the `Span` component.

### `gridSpanVariants`

```typescript
const gridSpanVariants: ReturnType<typeof tv>
```

Variants for grid span styling.

## Props & Behavior

### Grid Props

#### `cols`

```typescript
cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "none"
```

Number of columns. Generates `oui-grid-cols-*` classes. Supports responsive syntax.

#### `rows`

```typescript
rows?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "none"
```

Number of rows. Generates `oui-grid-rows-*` classes. Supports responsive syntax.

#### `autoFlow`

```typescript
autoFlow?: "row" | "col" | "rowDense" | "colDense"
```

Grid auto-flow direction. Controls how items are placed in the grid.

#### `gap`, `gapX`, `gapY`

```typescript
gap?: 0 | 1 | 2 | 3 | 4 | 5
gapX?: 0 | 1 | 2 | 3 | 4 | 5
gapY?: 0 | 1 | 2 | 3 | 4 | 5
```

Spacing between grid items. `gap` sets both horizontal and vertical, `gapX`/`gapY` set individually.

### Span Props

#### `colSpan`

```typescript
colSpan?: "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
```

Number of columns this item should span. `"auto"` uses default grid placement.

#### `rowSpan`

```typescript
rowSpan?: "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
```

Number of rows this item should span. `"auto"` uses default grid placement.

### Inherited Props

Both `Grid` and `Span` inherit all props from `Box`, including spacing, sizing, decoration, and positioning props.

## Usage Examples

### Basic Grid

```tsx
import { Grid } from "@veltodefi/ui";

<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>;
```

### Responsive Grid

```tsx
import { Grid } from "@veltodefi/ui";

<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
  {widgets.map((widget) => (
    <WidgetCard key={widget.id} data={widget} />
  ))}
</Grid>;
```

### Grid with Spanning Items

```tsx
import { Grid } from "@veltodefi/ui";

<Grid cols={4} gap={4}>
  <Grid.span colSpan={2} rowSpan={2}>
    <LargeCard />
  </Grid.span>
  <Grid.span colSpan={2}>
    <SmallCard />
  </Grid.span>
  <Grid.span colSpan={2}>
    <SmallCard />
  </Grid.span>
</Grid>;
```

### Dashboard Layout

```tsx
import { Grid } from "@veltodefi/ui";

<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
  <Grid.span colSpan={{ md: 2, lg: 3 }}>
    <Header />
  </Grid.span>
  <Grid.span>
    <StatsCard />
  </Grid.span>
  <Grid.span>
    <StatsCard />
  </Grid.span>
  <Grid.span>
    <StatsCard />
  </Grid.span>
</Grid>;
```

### Using Span Directly

```tsx
import { Grid, Span } from "@veltodefi/ui";

<Grid cols={3} gap={4}>
  <Span colSpan={2}>Spans 2 columns</Span>
  <Span colSpan={1}>Spans 1 column</Span>
</Grid>;
```

## Implementation Notes

- `Grid` is built on top of `Box`, inheriting all its capabilities
- `Span` validates that it's a child of a `Grid` component (logs a warning if not)
- Grid variants extend `gapVariants` for consistent spacing
- `Grid.span` is attached as a static property for convenience, but `Span` can also be imported directly
- Column and row spans are limited to 1-9 for performance and design system consistency

## Integration Tips

1. Use `Grid` for dashboard layouts, card grids, and any layout requiring precise column/row control.
2. Combine `Grid` with `ScrollArea` for masonry-style layouts while preserving consistent spacing.
3. Use responsive `cols` to collapse cards into a single column on smaller screens.
4. When mixing absolute-positioned children, set `position="relative"` on `Grid` via Box props to anchor overlays.
5. Use `Grid.span` for cleaner JSX, or import `Span` directly if you prefer explicit imports.
6. For complex layouts, combine `colSpan` and `rowSpan` to create varied grid item sizes.
