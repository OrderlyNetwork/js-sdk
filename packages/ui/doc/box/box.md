# Box Reference

> Location: `packages/ui/src/box/box.tsx`, `packages/ui/src/box/index.ts`

## Overview

`Box` is the foundational layout primitive for the UI kit. It wraps any HTML element (div, span, section, etc.) and exposes a rich set of spacing, positioning, decoration, and visibility props through `tailwind-variants`. Higher-level components such as `Flex`, `Grid`, `Card`, and `Button` all reuse Box’s variant definitions to stay visually aligned.

## Source Structure

| File       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| `box.tsx`  | Implements `boxVariants`, the `Box` component, and `BoxProps`. |
| `index.ts` | Re-exports `Box` and `boxVariants`.                            |

## Exports & Types

### `Box`

```typescript
const Box: React.ForwardRefExoticComponent<
  BoxProps & React.RefAttributes<HTMLDivElement>
>
```

Forward ref component that can render as any HTML tag or forward styles to a child via Radix's `Slot`.

### `boxVariants`

```typescript
const boxVariants: ReturnType<typeof tv>
```

Collects layout, shadow, decoration, position, and visibility variants for reuse.

### `BoxProps`

```typescript
interface BoxProps
  extends React.ButtonHTMLAttributes<HTMLDivElement | HTMLSpanElement>,
    Omit<
      VariantProps<typeof boxVariants>,
      "__position" | "__size_width" | "__size_height"
    > {
  asChild?: boolean;
  as?:
    | "div"
    | "span"
    | "nav"
    | "section"
    | "article"
    | "aside"
    | "header"
    | "footer";
  width?: string | number;
  height?: string | number;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  angle?: number;
}
```

Extends HTML attributes with Box-specific fields for element control, spacing, sizing, decoration, and positioning.

## Props & Behavior

- **Element control**: `as` chooses the DOM tag; `asChild` lets Box pass styles to an existing child element.
- **Spacing**: `p`, `px`, `py`, `m`, `mx`, `my`, `pt`, `mb`, etc. Numeric values are parsed via `parseSizeProps` and converted to Tailwind classes.
- **Sizing**: `width`, `height` accept numbers or strings and are applied through inline styles with helper flags (`__size_width`, `__size_height`) to prevent redundant classes.
- **Decoration**: `shadow`, `border`, `gradient`, `intensity`, `borderColor`, `r` (radius) map to design tokens.
- **Positioning**: `position`, `top`, `right`, `bottom`, `left`, `zIndex`, `invisible`, `grow` all plug into `positionVariants` / `visibleVariants`.
- **Angle**: When using gradient options, `angle` controls the gradient direction in degrees.

## Usage

```tsx
import { Box } from "@veltodefi/ui";

<Box p={4} shadow="md" border="base" r="xl" width={360}>
  <h4 className="oui-text-base">Wallet balance</h4>
</Box>

<Box asChild p={2}>
  <a href="/markets">Browse markets</a>
</Box>
```

## Implementation Notes

- `parseSizeProps` splits spacing/sizing props from the rest, ensuring unsupported attributes don’t leak onto the DOM.
- Variant flags such as `__position` prevent Tailwind from generating conflicting classes when no positional props are supplied.
- `Slot` support (`asChild`) is ideal when styling Next.js `Link`, custom buttons, or Router components without extra wrapper nodes.

## Integration Tips

1. Create higher-level primitives (e.g., KPI cards) by composing Box and exposing only the subset of props you want teams to tweak.
2. Use `gradient` + `angle` for marketing banners while still leveraging the design token palette.
3. In high-frequency lists, keep props minimal to reduce `tv` computation overhead, or memoize Box variants when possible.
4. Combine Box with `useObserverElement` to watch when a styled container enters the viewport—helpful for lazy-loading charts/cards.
