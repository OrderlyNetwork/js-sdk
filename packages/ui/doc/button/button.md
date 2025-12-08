# Button Reference

> Location: `packages/ui/src/button/button.tsx`, `packages/ui/src/button/base.tsx`, `packages/ui/src/button/throttledButton.tsx`, `packages/ui/src/button/index.ts`

## Overview

The Button family standardizes call-to-action elements across the UI kit. It exposes a `tailwind-variants` matrix for size, color, variant, and shadow combinations, plus utility components for advanced behavior:

- `BaseButton`: low-level primitive with focus/disabled handling, loading state, and icon support.
- `Button`: themed button with variant/color props built on `BaseButton`.
- `ThrottledButton`: prevents repeated clicks by introducing a cool-down period.

## Source Structure

| File                  | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `base.tsx`            | Implements `BaseButton`, handling `asChild`, loading state, icon rendering, and focus management. |
| `button.tsx`          | Declares `buttonVariants`, exports `Button`, `buttonVariants`, and `ButtonProps`.                 |
| `throttledButton.tsx` | Wraps `Button` with throttling logic using `useRef` and `useCallback`.                            |
| `index.ts`            | Re-exports `Button`, `ThrottledButton`, `buttonVariants`, and `ButtonProps`.                      |

## Exports & Types

### `Button`

```typescript
const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>
```

Main button component with variant, color, size, and shadow props.

### `BaseButton`

```typescript
const BaseButton: React.ForwardRefExoticComponent<
  BaseButtonProps & React.RefAttributes<HTMLButtonElement>
>
```

Low-level button primitive with loading state, icon support, and `asChild` capability. Not exported directly but used by `Button`.

### `ThrottledButton`

```typescript
const ThrottledButton: React.ForwardRefExoticComponent<
  ButtonProps & { throttleDuration?: number } & React.RefAttributes<HTMLButtonElement>
>
```

Button wrapper that throttles click events to prevent rapid repeated clicks.

### `buttonVariants`

```typescript
const buttonVariants: ReturnType<typeof tv>
```

Tailwind variants function for button styling. Can be reused in custom button-like components.

### `ButtonProps`

```typescript
interface ButtonProps
  extends Omit<BaseButtonProps, "size">,
    VariantProps<typeof buttonVariants> {
  angle?: number;
  "data-testid"?: string;
}
```

Extends `BaseButtonProps` with button-specific variant props.

### `BaseButtonProps`

```typescript
interface BaseButtonProps
  extends ComponentPropsWithout<"button", RemovedProps> {
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  asChild?: boolean;
  size: SizeType;
  icon?: React.ReactElement;
  as?: "button" | "a";
}
```

## Props & Behavior

### Button Props

#### `variant`

```typescript
variant?: "text" | "outlined" | "contained" | "gradient"
```

Button style variant. Default: `"contained"`.

#### `color`

```typescript
color?: "primary" | "secondary" | "success" | "buy" | "danger" | "sell" | "warning" | "gray" | "light"
```

Button color theme. Default: `"primary"`.

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Button size. Heights: `xs` (24px), `sm` (28px), `md` (32px), `lg` (40px), `xl` (54px). Default: `"lg"`.

#### `shadow`

```typescript
shadow?: VariantProps<typeof shadowVariants>["shadow"]
```

Shadow elevation level. Inherits from `layout/shadow.tsx`.

#### `fullWidth`

```typescript
fullWidth?: boolean
```

Stretch button to full width of container.

#### `angle`

```typescript
angle?: number
```

Gradient angle in degrees (used with `variant="gradient"`).

### BaseButton Props (inherited by Button)

#### `loading`

```typescript
loading?: boolean
```

Show loading spinner and disable button. When `true`, button is disabled and shows a `Spinner` instead of content.

#### `leading`

```typescript
leading?: React.ReactNode
```

Content to display before button text (e.g., icons).

#### `trailing`

```typescript
trailing?: React.ReactNode
```

Content to display after button text (e.g., icons).

#### `icon`

```typescript
icon?: React.ReactElement
```

Icon element. Automatically sized based on `size` prop and hidden when `loading` is `true`.

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix `Slot` to merge props with child element (useful for Next.js `Link`).

#### `as`

```typescript
as?: "button" | "a"
```

HTML element type. Default: `"button"`.

#### `disabled`

```typescript
disabled?: boolean
```

Disable button. When `loading` is `true`, button is automatically disabled.

### ThrottledButton Props

#### `throttleDuration`

```typescript
throttleDuration?: number
```

Throttle duration in milliseconds. Default: `700`.

Inherits all `ButtonProps`.

## Usage Examples

### Basic Buttons

```tsx
import { Button } from "@veltodefi/ui";

<Button variant="contained" color="primary" size="lg">
  Primary Button
</Button>

<Button variant="outlined" color="secondary" size="md">
  Outlined Button
</Button>

<Button variant="text" color="danger" size="sm">
  Text Button
</Button>
```

### Button with Loading State

```tsx
import { Button } from "@veltodefi/ui";

<Button
  variant="contained"
  color="primary"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Submit Order
</Button>;
```

### Button with Icons

```tsx
import { Button } from "@veltodefi/ui";
import { PlusIcon, ArrowRightIcon } from "@veltodefi/ui";

<Button
  variant="contained"
  color="primary"
  leading={<PlusIcon />}
>
  Add Item
</Button>

<Button
  variant="outlined"
  trailing={<ArrowRightIcon />}
>
  Continue
</Button>

<Button
  icon={<PlusIcon />}
  size="sm"
>
  Add
</Button>
```

### Gradient Button

```tsx
import { Button } from "@veltodefi/ui";

<Button variant="gradient" color="primary" angle={90} size="xl">
  Gradient Button
</Button>;
```

### Full Width Button

```tsx
import { Button } from "@veltodefi/ui";

<Button variant="contained" color="primary" fullWidth>
  Full Width Button
</Button>;
```

### Throttled Button

```tsx
import { ThrottledButton } from "@veltodefi/ui";

<ThrottledButton
  throttleDuration={1000}
  variant="contained"
  color="danger"
  onClick={handleDelete}
>
  Delete
</ThrottledButton>;
```

### Button as Link

```tsx
import { Button } from "@veltodefi/ui";

<Button asChild variant="text" color="primary">
  <a href="/markets">View Markets</a>
</Button>;
```

### Color Variants

```tsx
import { Button } from "@veltodefi/ui";

<Button variant="contained" color="buy">Buy</Button>
<Button variant="contained" color="sell">Sell</Button>
<Button variant="contained" color="success">Success</Button>
<Button variant="contained" color="danger">Danger</Button>
<Button variant="contained" color="warning">Warning</Button>
```

## Implementation Notes

- `buttonVariants` composes `shadowVariants` and custom compound variants to keep icon/text contrast balanced
- `BaseButton` ensures `type="button"` by default, preventing accidental form submissions
- When `loading` is `true`, `BaseButton` renders an invisible copy of the content with a `Spinner` overlay for layout stability
- Icon size is automatically calculated based on button size: `xs/sm` → 12px, `md` → 14px, `lg` → 16px, `xl` → 18px
- `ThrottledButton` uses `useRef` to track last click time and `useCallback` for the throttled handler
- Throttling prevents clicks within the `throttleDuration` window by checking time elapsed since last click
- Compound variants in `buttonVariants` ensure proper color combinations for each variant type

## Integration Tips

1. Use `ThrottledButton` for API-heavy actions (cancel order, submit transaction) to avoid double submissions.
2. Use `loading` prop instead of manually managing disabled state and spinners—it handles both automatically.
3. Use `leading`/`trailing` for icons that should be visible during loading, or `icon` for standalone icon buttons.
4. Use `asChild` with Next.js `Link` or router links to avoid extra wrapper elements.
5. Use `buttonVariants` in custom components (e.g., `CommandItem`, `MenuItem`) to ensure visual parity.
6. When theming, extend `color` or `shadow` variants in `button.tsx` to propagate changes across the UI.
7. For gradient buttons, adjust `angle` to match design requirements (0° = left to right, 90° = top to bottom).
