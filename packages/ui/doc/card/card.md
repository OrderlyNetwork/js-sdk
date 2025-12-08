# Card Reference

> Location: `packages/ui/src/card/cardBase.tsx`, `packages/ui/src/card/card.tsx`, `packages/ui/src/card/hoverCard.tsx`, `packages/ui/src/card/index.ts`

## Overview

Cards organize structured content such as balances, market stats, or strategy tiles. The Card module splits concerns between `CardBase` (layout + surfaces), slot components (`CardHeader`, `CardContent`, `CardFooter`, `CardTitle`), the convenience `Card` wrapper, and a `HoverCard` built on top of Radix HoverCard for contextual previews.

## Source Structure

| File            | Description                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `cardBase.tsx`  | Declares `CardBase`, slot components (`CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`), and `cardVariants`. |
| `card.tsx`      | Provides the `Card` convenience component with `title`, `footer`, and `classNames` props.                                             |
| `hoverCard.tsx` | Composes Radix HoverCard primitives with Orderly styling.                                                                             |
| `index.ts`      | Public exports for all card-related pieces.                                                                                           |

## Exports & Types

### `Card`

```typescript
const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>
```

High-level wrapper that renders header, content, and optional footer based on props.

### `CardBase`

```typescript
const CardBase: React.ForwardRefExoticComponent<
  BaseCardProps & React.RefAttributes<HTMLDivElement>
>
```

Low-level container to mix & match header/content/footer manually.

### `CardHeader`

```typescript
const CardHeader: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
```

Header slot component.

### `CardContent`

```typescript
const CardContent: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
```

Content slot component.

### `CardFooter`

```typescript
const CardFooter: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
```

Footer slot component.

### `CardTitle`

```typescript
const CardTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>
>
```

Title slot component (renders as `<h3>`).

### `CardDescription`

```typescript
const CardDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
>
```

Description slot component (renders as `<p>`).

### `HoverCard`

```typescript
const HoverCard: React.FC<HoverCardProps & Omit<React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>, "content">>
```

Displays supplemental content on hover/focus (e.g., fee explanations).

### `HoverCardRoot`, `HoverCardTrigger`, `HoverCardContent`

```typescript
const HoverCardRoot: typeof HoverCardPrimitive.Root
const HoverCardTrigger: typeof HoverCardPrimitive.Trigger
const HoverCardContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & React.RefAttributes<HTMLDivElement>
>
```

Low-level Radix HoverCard primitives.

### `cardVariants`

```typescript
const cardVariants: ReturnType<typeof tv>
```

Tailwind variants for card styling.

### `CardProps`

```typescript
interface CardProps extends BaseCardProps {
  title?: ReactNode;
  footer?: ReactNode;
  classNames?: {
    root?: string;
    header?: string;
    content?: string;
    footer?: string;
  };
}
```

### `BaseCardProps`

```typescript
type BaseCardProps = ComponentPropsWithout<"div", "color" | "title"> &
  VariantProps<typeof cardVariants>;
```

Extends `div` props with card-specific variant props.

### `HoverCardProps`

```typescript
interface HoverCardProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {
  className?: string;
  content: React.ReactNode;
}
```

## Props & Behavior

### Card Props

#### `title`

```typescript
title?: ReactNode
```

Card title. When a string, automatically wrapped with `CardTitle` to keep typography consistent.

#### `footer`

```typescript
footer?: ReactNode
```

Card footer content.

#### `classNames`

```typescript
classNames?: {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
}
```

Class name overrides for card slots.

### BaseCard Props

#### `intensity`

```typescript
intensity?: VariantProps<typeof decorationVariants>["intensity"]
```

Background intensity variant. Default: `900`.

Inherits all `decorationVariants` props (border, gradient, etc.).

### HoverCard Props

#### `content` (required)

```typescript
content: React.ReactNode;
```

Content to display in the hover card.

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

#### `openDelay`

```typescript
openDelay?: number
```

Delay in milliseconds before opening. Default: `700`.

#### `closeDelay`

```typescript
closeDelay?: number
```

Delay in milliseconds before closing. Default: `300`.

#### `align`, `sideOffset`, etc.

Inherits all Radix HoverCard Content props for positioning.

## Usage Examples

### Basic Card

```tsx
import { Card } from "@orderly.network/ui";

<Card title="Portfolio">
  <BalanceOverview />
</Card>;
```

### Card with Footer

```tsx
import { Card, Button } from "@orderly.network/ui";

<Card
  title="Portfolio"
  footer={<Button size="sm">Manage</Button>}
  classNames={{ content: "oui-space-y-3" }}
>
  <BalanceOverview />
</Card>;
```

### Custom Card Layout

```tsx
import {
  CardBase,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@orderly.network/ui";

<CardBase>
  <CardHeader>
    <CardTitle>Custom Layout</CardTitle>
    <CardDescription>This is a description</CardDescription>
  </CardHeader>
  <CardContent>
    <CustomContent />
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</CardBase>;
```

### HoverCard

```tsx
import { HoverCard, Text } from "@orderly.network/ui";

<HoverCard
  trigger={<Text className="oui-underline">Funding fees</Text>}
  content={<div className="oui-w-64">Detailed explanation…</div>}
  openDelay={200}
/>;
```

### HoverCard with Controlled State

```tsx
import { useState } from "react";
import { HoverCard, Text } from "@orderly.network/ui";

function FeeTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      content={<div>Fee calculation details</div>}
    >
      <Text>Hover for details</Text>
    </HoverCard>
  );
}
```

## Implementation Notes

- Card surfaces reuse `Box` tokens for borders (`oui-border-line-8`), backgrounds, and shadows, so theming changes stay centralized
- `classNames` overrides make it easy to remove padding (`content: "!oui-p-0"`) for tables or embed `ScrollArea` inside
- When `title` is a string, `Card` automatically wraps it with `CardTitle` to keep typography consistent
- Hover cards default to high z-index overlays; wrap them with `TooltipProvider` if you need shared delay control
- `CardContent` has default `pt-4` padding; override via `classNames.content` if needed

## Integration Tips

1. Combine `CardHeader` with `Tabs` or `Select` components to create interactive dashboards while retaining consistent spacing.
2. Use `CardBase` + `Flex` for bespoke tiles that still honor the same border radius and background as default cards.
3. When embedding charts, set `classNames.content` to `"oui-p-0"` and wrap the chart in `Box` to manage padding separately.
4. For SSR/CSR parity, gate `HoverCard` usage on `useScreen().isMobile` and fall back to `Dialog` or `Sheet` on touch devices.
5. Use `CardDescription` for subtitles or helper text in card headers.
6. Combine `Card` with `Grid` or `Flex` to create responsive card layouts.
