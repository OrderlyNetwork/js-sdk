# Popover Reference

> Location: `packages/ui/src/popover/popover.tsx`, `packages/ui/src/popover/index.ts`

## Overview

`Popover` wraps Radix Popover to deliver lightweight overlays for filters, inline forms, or informational cards. It brings consistent surfaces (rounded corners, borders, shadows) and re-exports Radix primitives for composability.

## Source Structure

| File          | Description                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `popover.tsx` | Exports `Popover`, `PopoverRoot`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `popoverVariants`, and low-level primitives. |
| `index.ts`    | Re-exports the same primitives.                                                                                                     |

## Exports & Types

### `Popover`

```typescript
const Popover: React.FC<React.PropsWithChildren<PopoverProps>>
```

High-level popover component with `content` prop.

### `PopoverRoot`

```typescript
const PopoverRoot: typeof PopoverPrimitive.Root
```

Root component for popover state management.

### `PopoverTrigger`

```typescript
const PopoverTrigger: typeof PopoverPrimitive.Trigger
```

Trigger element that opens/closes the popover.

### `PopoverContent`

```typescript
const PopoverContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
    VariantProps<typeof popoverVariants> &
    React.RefAttributes<HTMLDivElement>
>
```

Popover content container.

### `PopoverAnchor`

```typescript
const PopoverAnchor: typeof PopoverPrimitive.Anchor
```

Anchor element for positioning the popover.

### `popoverVariants`

```typescript
const popoverVariants: ReturnType<typeof tv>
```

Tailwind variants for popover styling.

### `PopoverProps`

```typescript
type PopoverProps = PopoverPrimitive.PopoverProps & {
  content: React.ReactNode;
  arrow?: boolean;
  contentProps?: PopoverPrimitive.PopoverContentProps;
};
```

## Props & Behavior

### Popover Props

#### `content` (required)

```typescript
content: React.ReactNode;
```

Content to display in the popover.

#### `arrow`

```typescript
arrow?: boolean
```

Show arrow pointing to trigger. Default: `false`.

#### `contentProps`

```typescript
contentProps?: PopoverPrimitive.PopoverContentProps
```

Additional props for `PopoverContent`.

Inherits all Radix PopoverRoot props: `open`, `defaultOpen`, `onOpenChange`, `modal`, etc.

### PopoverContent Props

Inherits all Radix PopoverContent props:

#### `side`

```typescript
side?: "top" | "right" | "bottom" | "left"
```

Side of the trigger to show popover. Default: `"bottom"`.

#### `align`

```typescript
align?: "start" | "center" | "end"
```

Alignment relative to trigger. Default: `"center"`.

#### `sideOffset`

```typescript
sideOffset?: number
```

Distance from trigger. Default: `4`.

#### `collisionPadding`

```typescript
collisionPadding?: number
```

Padding for collision detection.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

## Usage Examples

### Basic Popover

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@orderly.network/ui";

<Popover content={<FilterForm />}>
  <PopoverTrigger asChild>
    <Button variant="text">Filters</Button>
  </PopoverTrigger>
</Popover>;
```

### Popover with Arrow

```tsx
import { Popover } from "@orderly.network/ui";

<Popover
  content={<FilterForm />}
  arrow={true}
  contentProps={{ align: "end", sideOffset: 8, className: "oui-w-72" }}
>
  <Button variant="text">Filters</Button>
</Popover>;
```

### Using Low-Level Primitives

```tsx
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@orderly.network/ui";

<PopoverRoot>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent align="end" sideOffset={8} className="oui-w-72">
    <FilterForm />
  </PopoverContent>
</PopoverRoot>;
```

### Controlled Popover

```tsx
import { useState } from "react";
import { Popover } from "@orderly.network/ui";

function ControlledPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} content={<FilterForm />}>
      <Button>Toggle</Button>
    </Popover>
  );
}
```

## Implementation Notes

- Popover uses Radix primitives for accessibility and positioning
- Default styling includes `oui-rounded-md`, `oui-border-line-6`, `oui-bg-base-8`, `oui-shadow-md`
- Content is rendered in a Portal to avoid z-index issues
- Animations use `animate-in` and `animate-out` classes for smooth transitions

## Integration Tips

1. Wrap popovers in `TooltipProvider` if you need consistent delay configuration for nested overlays.
2. For long content, add `ScrollArea` inside `PopoverContent` to maintain a fixed height.
3. On mobile, swap popovers for `Sheet` or `Dialog` to accommodate touch interactions and keyboard focus.
4. Use `contentProps` to customize positioning and styling of the popover content.
5. Combine with `Button` or other interactive elements using `asChild` to avoid extra wrappers.
