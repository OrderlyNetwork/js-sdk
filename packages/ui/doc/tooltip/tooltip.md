# Tooltip Reference

> Location: `packages/ui/src/tooltip/tooltip.tsx`, `packages/ui/src/tooltip/index.ts`

## Overview

`Tooltip` wraps Radix Tooltip and exposes provider, trigger, and content components with consistent spacing and delay defaults. Use it for brief annotations on icons, buttons, or form labels.

## Source Structure

| File          | Description                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tooltip.tsx` | Exports `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent`, `TooltipArrow`, `TooltipPortal`, and `tooltipVariants`. |
| `index.ts`    | Re-exports the API.                                                                                                                   |

## Exports & Types

### `TooltipProvider`

```typescript
const TooltipProvider: typeof TooltipPrimitive.Provider
```

Provider component that manages tooltip delays and behavior globally.

### `TooltipRoot`

```typescript
const TooltipRoot: typeof TooltipPrimitive.Root
```

Root component for tooltip state management.

### `TooltipTrigger`

```typescript
const TooltipTrigger: typeof TooltipPrimitive.Trigger
```

Trigger element that shows the tooltip on hover or focus.

### `TooltipContent`

```typescript
const TooltipContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    React.RefAttributes<HTMLDivElement>
>
```

Tooltip content container.

### `TooltipArrow`

```typescript
const TooltipArrow: (props: {
  className?: string;
  style?: React.CSSProperties;
}) => JSX.Element
```

Arrow component pointing to the trigger.

### `TooltipPortal`

```typescript
const TooltipPortal: typeof TooltipPrimitive.Portal
```

Portal component for rendering tooltip outside the DOM hierarchy.

### `tooltipVariants`

```typescript
const tooltipVariants: ReturnType<typeof tv>
```

Tailwind variants for tooltip styling.

## Props & Behavior

### TooltipProvider Props

Inherits all Radix TooltipProvider props:

#### `delayDuration`

```typescript
delayDuration?: number
```

Delay in milliseconds before showing tooltip. Default: `700`.

#### `skipDelayDuration`

```typescript
skipDelayDuration?: number
```

Delay in milliseconds before showing tooltip when moving between triggers. Default: `300`.

#### `disableHoverableContent`

```typescript
disableHoverableContent?: boolean
```

Disable hoverable content behavior.

### TooltipRoot Props

Inherits all Radix TooltipRoot props:

#### `open`

```typescript
open?: boolean
```

Controlled open state.

#### `defaultOpen`

```typescript
defaultOpen?: boolean
```

Uncontrolled default open state.

#### `onOpenChange`

```typescript
onOpenChange?: (open: boolean) => void
```

Callback when open state changes.

### TooltipTrigger Props

Inherits all Radix TooltipTrigger props:

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix `Slot` to merge props with child element.

### TooltipContent Props

Inherits all Radix TooltipContent props:

#### `side`

```typescript
side?: "top" | "right" | "bottom" | "left"
```

Side of the trigger to show tooltip. Default: `"top"`.

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

#### `className`

```typescript
className?: string
```

Additional CSS classes.

## Usage Examples

### Basic Tooltip

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@veltodefi/ui";
import { InfoCircleIcon } from "@veltodefi/ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <InfoCircleIcon className="oui-text-base-contrast-54" />
    </TooltipTrigger>
    <TooltipContent side="top" align="start">
      Funding fees update every hour.
    </TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

### Tooltip with Arrow

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@veltodefi/ui";

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="text">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <TooltipArrow />
    Tooltip content
  </TooltipContent>
</Tooltip>;
```

### Controlled Tooltip

```tsx
import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@veltodefi/ui";

function ControlledTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button>Toggle Tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>This tooltip is controlled</TooltipContent>
    </Tooltip>
  );
}
```

## Implementation Notes

- Tooltip uses Radix primitives for accessibility and keyboard navigation
- Default styling ensures contrast on dark surfaces with `oui-bg-base-8` and `oui-text-base-contrast`
- Animations use `animate-in` and `animate-out` classes for smooth transitions
- `TooltipProvider` should be mounted near the root to control delays globally

## Integration Tips

1. Mount a single `TooltipProvider` near the root to control delays globally.
2. Keep tooltips concise—use `Popover` or `Dialog` for multi-paragraph explanations.
3. Ensure triggers are focusable so keyboard users can access the tooltip (`asChild` with `<button>` or `tabIndex={0}`).
4. Use `side` and `align` props to position tooltips appropriately based on available space.
5. Combine with icons or buttons using `asChild` to avoid extra wrapper elements.
