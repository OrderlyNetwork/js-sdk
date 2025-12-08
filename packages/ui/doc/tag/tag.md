# Tag Reference

> Location: `packages/ui/src/tag/tag.tsx`, `packages/ui/src/tag/index.ts`

## Overview

`Tag` renders interactive tokens for filters, categories, or chips. Compared to `Badge`, tags usually support close buttons and more flexible shapes.

## Source Structure

| File       | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `tag.tsx`  | Declares the `Tag` component, `tagVariants`, and `TagProps`. |
| `index.ts` | Re-exports `Tag`, `tagVariants`, and `TagProps`.             |

## Exports & Types

### `Tag`

```typescript
const Tag: React.ForwardRefExoticComponent<
  TagProps & React.RefAttributes<HTMLDivElement>
>
```

Tag/chip component for filters and categories.

### `tagVariants`

```typescript
const tagVariants: ReturnType<typeof tv>
```

Tailwind variants for tag styling.

### `TagProps`

```typescript
interface TagProps
  extends ComponentPropsWithout<"div", RemovedProps>,
    VariantProps<typeof tagVariants> {
  asChild?: boolean;
  tag?: "span" | "div";
}
```

Extends `div` props with tag-specific variant props.

## Props & Behavior

### Tag Props

#### `color`

```typescript
color?: "primary" | "success" | "warning" | "danger"
```

Tag color variant.

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix `Slot` to merge props with child element.

#### `tag`

```typescript
tag?: "span" | "div"
```

HTML element to render. Default: `"span"`.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

**Note:** Tag supports all standard `div` attributes. Colors/variants parallel `Badge` and `Button` palettes for consistency.

## Usage Examples

### Basic Tag

```tsx
import { Tag } from "@veltodefi/ui";

<Tag color="primary">Primary Tag</Tag>
<Tag color="success">Success Tag</Tag>
<Tag color="warning">Warning Tag</Tag>
<Tag color="danger">Danger Tag</Tag>
```

### Tag with Custom Content

```tsx
import { Tag } from "@veltodefi/ui";

<Tag color="primary" className="oui-px-2 oui-py-1 oui-rounded">
  Custom Tag
</Tag>;
```

### Tag as Child

```tsx
import { Tag } from "@veltodefi/ui";

<Tag asChild>
  <button onClick={handleClick}>Clickable Tag</button>
</Tag>;
```

### Tag Clusters

```tsx
import { Tag, Flex } from "@veltodefi/ui";

<Flex gap={2} wrap="wrap">
  {filters.map((filter) => (
    <Tag key={filter.id} color="primary">
      {filter.label}
    </Tag>
  ))}
</Flex>;
```

## Implementation Notes

- Tag uses `Slot` for `asChild` support, allowing props to be merged with child elements
- Default rendering element is `span` for inline display
- Color variants use semantic color tokens for consistency

## Integration Tips

1. Use `prefix`/`suffix` to show icons or values (e.g., percentages) alongside the tag label.
2. For clusters of tags, wrap them in `Flex` with `gap` and consider `ScrollIndicator` if they overflow horizontally.
3. When tags represent active filters, expose removal through keyboard interactions (`Enter`/`Space` on the close button).
4. Combine with `Badge` for different use cases: `Badge` for status indicators, `Tag` for interactive filters.
5. Use `asChild` to make tags clickable or integrate with routing libraries.
