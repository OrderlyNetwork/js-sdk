# Flex Reference

> Location: `packages/ui/src/flex/flex.tsx`, `packages/ui/src/flex/index.ts`

## Overview

`Flex` extends `Box` with a dedicated Flexbox API, exposing direction, alignment, wrapping, and gap variants while retaining all Box spacing/decoration props. It is the go-to container for aligning badges, buttons, and cards.

## Source Structure

| File       | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `flex.tsx` | Defines `flexVariant`, the `Flex` component, and `FlexProps`. |
| `index.ts` | Re-exports `Flex`, `flexVariant`, and `FlexProps`.            |

## Exports & Types

### `Flex`

```typescript
const Flex: React.ForwardRefExoticComponent<
  FlexProps & React.RefAttributes<HTMLDivElement>
>
```

Flexbox container component built on top of `Box` with additional flex-specific props.

### `flexVariant`

```typescript
const flexVariant: ReturnType<typeof tv>
```

Tailwind variants function for flex styling. Can be used to create custom flex-based components.

### `FlexProps`

```typescript
interface FlexProps extends BoxProps, VariantProps<typeof flexVariant> {}
```

Extends `BoxProps` with flex-specific variant props. Inherits all spacing, sizing, border, and decoration props from `Box`.

## Props & Behavior

### Flex-Specific Props

#### `display`

```typescript
display?: "flex" | "inlineFlex"
```

Controls the display type. Default: `"flex"`.

#### `direction`

```typescript
direction?: "row" | "rowReverse" | "column" | "columnReverse"
```

Flex direction. Default: `"row"`. Supports responsive syntax: `{ base: "column", md: "row" }`.

#### `justify`

```typescript
justify?: "start" | "end" | "center" | "between" | "around" | "evenly" | "stretch"
```

Justify content alignment. Default: `"start"`.

#### `itemAlign`

```typescript
itemAlign?: "start" | "end" | "center" | "baseline" | "stretch"
```

Align items. Default: `"center"`.

#### `wrap`

```typescript
wrap?: "noWrap" | "wrap" | "wrapReverse"
```

Flex wrap behavior. Default: `"noWrap"`.

#### `gap`, `gapX`, `gapY`

```typescript
gap?: number | { base?: number; md?: number; lg?: number }
gapX?: number | { base?: number; md?: number; lg?: number }
gapY?: number | { base?: number; md?: number; lg?: number }
```

Spacing between flex items. Supports responsive syntax. Uses `gapVariants` internally.

### Inherited Props

`Flex` inherits all props from `Box`, including:

- Spacing: `p`, `px`, `py`, `m`, `mx`, `my`, etc.
- Sizing: `width`, `height`
- Decoration: `shadow`, `border`, `gradient`, `r` (radius)
- Positioning: `position`, `top`, `right`, `bottom`, `left`, `zIndex`
- Visibility: `invisible`
- Element control: `as`, `asChild`

## Usage Examples

### Basic Flex Layout

```tsx
import { Flex } from "@orderly.network/ui";

<Flex direction="row" gap={4} justify="between" itemAlign="center">
  <Button>Left</Button>
  <Button>Right</Button>
</Flex>;
```

### Responsive Flex

```tsx
import { Flex } from "@orderly.network/ui";

<Flex
  direction={{ base: "column", lg: "row" }}
  gap={{ base: 2, lg: 4 }}
  justify="between"
>
  <ProfitCard />
  <Flex gap={2}>
    <Button>Deposit</Button>
    <Button variant="outlined">Withdraw</Button>
  </Flex>
</Flex>;
```

### Wrapped Flex Items

```tsx
import { Flex } from "@orderly.network/ui";

<Flex wrap="wrap" gap={2}>
  {tags.map((tag) => (
    <Badge key={tag}>{tag}</Badge>
  ))}
</Flex>;
```

### Vertical Stack

```tsx
import { Flex } from "@orderly.network/ui";

<Flex direction="column" gap={3}>
  <Input placeholder="Email" />
  <Input placeholder="Password" type="password" />
  <Button>Sign In</Button>
</Flex>;
```

## Implementation Notes

- `Flex` is built on top of `Box`, so it supports all Box props and styling capabilities
- Uses `flexVariant` which extends `gapVariants` for consistent spacing
- Supports responsive variants through `tailwind-variants` responsive syntax
- Default variants ensure sensible defaults: `display="flex"`, `direction="row"`, `itemAlign="center"`, `justify="start"`, `wrap="noWrap"`

## Integration Tips

1. Use `Flex` for most layout needs—it's more flexible than `Grid` for dynamic content.
2. Combine `Flex` with `ScrollIndicator` to create horizontally scrollable button rows.
3. Use responsive `direction` to stack items vertically on mobile and horizontally on desktop.
4. For performance-sensitive virtual lists, consider using `Box` with manual class strings to reduce `tv` computation overhead.
5. Use `gap` instead of margins for spacing between flex items—it's more predictable and easier to maintain.
