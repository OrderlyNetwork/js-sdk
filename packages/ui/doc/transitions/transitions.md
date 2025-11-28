# Transitions Reference

> Location: `packages/ui/src/transitions/fade.tsx`

## Overview

The transitions module currently offers a `Fade` component—a simple wrapper around CSS transitions for mount/unmount animation. It's useful for bringing subtle motion to dropdowns, cards, or skeleton replacements without pulling in heavyweight animation libraries.

## Source Structure

| File       | Description                                    |
| ---------- | ---------------------------------------------- |
| `fade.tsx` | Exports `Fade` component and `FadeProps` type. |

## Exports & Types

### `Fade`

```typescript
const Fade: React.FC<PropsWithChildren<FadeProps>>
```

Fade transition component for mount/unmount animations.

### `FadeProps`

```typescript
interface FadeProps extends React.HTMLAttributes<HTMLDivElement> {
  in: boolean;
  asChild?: boolean;
}
```

Extends `div` attributes with fade-specific props.

## Props & Behavior

### Fade Props

#### `in` (required)

```typescript
in: boolean
```

Boolean controlling visibility. When `true`, content is visible; when `false`, content fades out.

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix `Slot` to merge props with child element. Default: `false`.

#### `className`

```typescript
className?: string
```

Additional CSS classes. Automatically includes `oui-animate`, `oui-fade-in`, and `oui-fade-out` classes.

Inherits all standard `HTMLAttributes<HTMLDivElement>`.

## Usage Examples

### Basic Fade

```tsx
import { Fade } from "@orderly.network/ui";

<Fade in={isOpen}>
  <Box className="oui-bg-base-8 oui-rounded-xl">Animated content</Box>
</Fade>;
```

### Fade with Custom Duration

```tsx
import { Fade } from "@orderly.network/ui";

<Fade in={isVisible} className="oui-duration-200">
  <div>Content with custom duration</div>
</Fade>;
```

### Fade as Child

```tsx
import { Fade } from "@orderly.network/ui";

<Fade in={isOpen} asChild>
  <button>Clickable faded button</button>
</Fade>;
```

### Controlled Fade

```tsx
import { useState } from "react";
import { Fade } from "@orderly.network/ui";

function ControlledFade() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(!visible)}>Toggle</button>
      <Fade in={visible}>
        <div>This content fades in and out</div>
      </Fade>
    </>
  );
}
```

## Implementation Notes

- Fade uses CSS animation classes (`oui-fade-in`, `oui-fade-out`) defined in Tailwind config
- Animation duration can be controlled via `className` with Tailwind duration utilities
- Component uses `Slot` for `asChild` support, allowing props to be merged with child elements
- Fade animations are lightweight and don't require JavaScript animation libraries

## Integration Tips

1. Combine `Fade` with `Collapsible` or `Popover` when you need extra polish on mount/unmount transitions.
2. Keep transitions short (150–250 ms) to avoid sluggish interactions.
3. If you need more complex motion (slide, scale), consider expanding this module with additional components following the same pattern.
4. Use `asChild` to apply fade animations to existing elements without extra wrappers.
5. Combine with conditional rendering to create smooth show/hide transitions.
