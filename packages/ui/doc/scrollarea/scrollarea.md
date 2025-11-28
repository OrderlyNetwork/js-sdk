# ScrollArea Reference

> Location: `packages/ui/src/scrollarea/scrollArea.tsx`, `packages/ui/src/scrollarea/index.ts`

## Overview

`ScrollArea` wraps Radix ScrollArea primitives to provide themed scrollbars, rounded containers, and consistent behavior for long lists or dropdown content.

## Source Structure

| File             | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `scrollArea.tsx` | Exports `ScrollArea`, `ScrollBar`, `ScrollThumb`, and `scrollAreaVariants`. |
| `index.ts`       | Re-exports the same components.                                             |

## Exports & Types

### `ScrollArea`

```typescript
const ScrollArea: React.ForwardRefExoticComponent<
  ScrollAreaProps & React.RefAttributes<HTMLDivElement>
>
```

Scrollable container component with themed scrollbars.

### `ScrollBar`

```typescript
const ScrollBar: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> &
    React.RefAttributes<HTMLDivElement>
>
```

Scrollbar component (vertical or horizontal).

### `ScrollThumb`

```typescript
const ScrollThumb: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaThumb> &
    React.RefAttributes<HTMLDivElement>
>
```

Scrollbar thumb (draggable handle).

### `scrollAreaVariants`

```typescript
const scrollAreaVariants: ReturnType<typeof tv>
```

Tailwind variants for scroll area styling.

### `ScrollAreaProps`

```typescript
interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollAreaVariants> {
  classNames?: {
    viewport?: string;
  };
}
```

## Props & Behavior

### ScrollArea Props

#### `orientation`

```typescript
orientation?: "vertical" | "horizontal"
```

Scrollbar orientation. Default: `"vertical"`.

#### `type`

```typescript
type?: "auto" | "always" | "scroll" | "hover"
```

Scrollbar visibility type. Inherited from Radix.

#### `dir`

```typescript
dir?: "ltr" | "rtl"
```

Text direction. Inherited from Radix.

#### `classNames`

```typescript
classNames?: {
  viewport?: string;
}
```

Class name overrides for viewport.

#### `className`

```typescript
className?: string
```

Additional CSS classes for root element.

Inherits all Radix ScrollAreaRoot props.

### ScrollBar Props

#### `orientation` (required)

```typescript
orientation: "vertical" | "horizontal";
```

Scrollbar orientation.

Inherits all Radix ScrollAreaScrollbar props.

## Usage Examples

### Basic ScrollArea

```tsx
import { ScrollArea } from "@orderly.network/ui";

<ScrollArea className="oui-h-64">
  <div className="oui-space-y-4">
    {items.map((item) => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
</ScrollArea>;
```

### ScrollArea with Custom Viewport

```tsx
import { ScrollArea } from "@orderly.network/ui";

<ScrollArea className="oui-h-64" classNames={{ viewport: "oui-p-4" }}>
  <LongContent />
</ScrollArea>;
```

### Horizontal ScrollArea

```tsx
import { ScrollArea } from "@orderly.network/ui";

<ScrollArea orientation="horizontal" className="oui-w-full">
  <div className="oui-flex oui-gap-4">
    {items.map((item) => (
      <Card key={item.id} className="oui-min-w-[200px]">
        {item.content}
      </Card>
    ))}
  </div>
</ScrollArea>;
```

### ScrollArea in Dropdown

```tsx
import { ScrollArea, DropdownContent } from "@orderly.network/ui";

<DropdownContent>
  <ScrollArea className="oui-max-h-64">
    {menuItems.map((item) => (
      <MenuItem key={item.id}>{item.label}</MenuItem>
    ))}
  </ScrollArea>
</DropdownContent>;
```

## Implementation Notes

- ScrollArea uses Radix primitives for cross-browser scrollbar styling
- Default wrapper includes `oui-relative`, `oui-overflow-hidden`, and `oui-scroll-area-root`
- Scrollbars use theme colors (`oui-bg-base-10` for thumb) and appear based on `type` prop
- Viewport uses `oui-rounded-[inherit]` to match container border radius

## Integration Tips

1. Wrap `DropdownContent` or `PopoverContent` in `ScrollArea` when rendering long menus to keep a fixed maximum height.
2. For nested scroll areas, disable wheel events or set `pointer-events` carefully to avoid scroll chaining.
3. Adjust scrollbar thickness via custom classes passed to `ScrollBar` if you need more pronounced handles.
4. Use `classNames.viewport` to add padding or other styling to the scrollable content area.
5. Combine with `Flex` or `Grid` for complex scrollable layouts.
