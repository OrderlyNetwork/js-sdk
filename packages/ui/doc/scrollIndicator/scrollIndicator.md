# ScrollIndicator Reference

> Location: `packages/ui/src/scrollIndicator/scrollIndicator.tsx`, `packages/ui/src/scrollIndicator/scrollButton.tsx`, `packages/ui/src/scrollIndicator/hooks/*.tsx`

## Overview

`ScrollIndicator` augments horizontally scrollable content (e.g., Tab lists) with draggable behavior and fade buttons on the leading/trailing edges. It helps users discover overflowed content while keeping the existing child layout intact.

## Source Structure

| File                  | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `scrollIndicator.tsx` | Main component orchestrating drag/scroll logic and buttons.                                    |
| `scrollButton.tsx`    | Renders arrow buttons with gradient fades.                                                     |
| `hooks/useScroll.ts`  | Tracks scroll position, exposing `leadingVisible`, `tailingVisible`, and `onScroll` callbacks. |
| `hooks/useDrag.ts`    | Implements mouse-drag scrolling.                                                               |
| `index.tsx`           | Re-exports `ScrollIndicator`.                                                                  |

## Exports & Types

### `ScrollIndicator`

```typescript
const ScrollIndicator: React.FC<ScrollIndicatorProps>
```

Scroll indicator component with drag support and fade buttons.

### `ScrollIndicatorProps`

```typescript
type ScrollIndicatorProps = {
  children: ReactNode;
  className?: string;
};
```

## Props & Behavior

### ScrollIndicator Props

#### `children` (required)

```typescript
children: ReactNode;
```

The scrollable content (usually a flex row of triggers or buttons).

#### `className`

```typescript
className?: string
```

Additional wrapper classes.

## Usage Examples

### Basic ScrollIndicator

```tsx
import { ScrollIndicator } from "@veltodefi/ui";

<ScrollIndicator className="oui-w-full">
  <TabsList>
    {markets.map((symbol) => (
      <TabsTrigger key={symbol} value={symbol}>
        {symbol}
      </TabsTrigger>
    ))}
  </TabsList>
</ScrollIndicator>;
```

### ScrollIndicator with Buttons

```tsx
import { ScrollIndicator, Flex, Button } from "@veltodefi/ui";

<ScrollIndicator>
  <Flex gap={2}>
    {actions.map((action) => (
      <Button key={action.id} size="sm">
        {action.label}
      </Button>
    ))}
  </Flex>
</ScrollIndicator>;
```

## Implementation Notes

- Adds `oui-hide-scrollbar` styles to the internal container while keeping native scrolling
- Buttons become visible when overflow exists on either side
- Mouse drag toggles `cursor-grab`/`cursor-grabbing` for tactile feedback
- Uses `IntersectionObserver` to detect scroll position and button visibility
- Drag scrolling is implemented via mouse event handlers

## Integration Tips

1. Hide `ScrollButton` on touch devices via CSS if native swipe is sufficient.
2. When combining with keyboard navigation, ensure arrow buttons have `aria-label`s and participate in the tab order if needed.
3. Adjust drag sensitivity by tweaking `useDrag` implementation if your content contains interactive elements (e.g., `button` triggers).
4. Use with `TabsList` or horizontal button groups to provide scroll hints.
5. Combine with `Flex` for horizontal scrollable layouts.
