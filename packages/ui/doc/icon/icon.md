# Icon Library Reference

> Location: `packages/ui/src/icon/*.tsx`

## Overview

The icon directory houses all proprietary SVG symbols used across Orderly—from basic UI glyphs (chevrons, close, check) to domain icons (markets, trading, vaults). Base helpers ensure consistent `viewBox`, fill/stroke defaults, and accessibility attributes.

## Source Structure

| File                   | Description                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `baseIcon.tsx`         | Generic SVG wrapper exposing `size`, `color`, `viewBox`, and accessibility props.          |
| `baseIconWithPath.tsx` | Similar to `baseIcon` but geared toward multi-path or filled icons.                        |
| `*.tsx`                | Individual icon components (e.g., `arrowDownUp.tsx`, `infoCircle.tsx`, `tradingIcon.tsx`). |
| `index.ts`             | Aggregates exports, allowing `import { Icon } from "@veltodefi/ui";`.                      |

## Exports & Types

### `BaseIcon`

```typescript
const BaseIcon: React.ForwardRefExoticComponent<
  BaseIconProps & React.RefAttributes<SVGSVGElement>
>
```

Base SVG icon component used by all icon implementations.

### `BaseIconProps`

```typescript
interface BaseIconProps
  extends ComponentPropsWithout<"svg", RemovedProps>,
    VariantProps<typeof iconVariants> {
  size?: number;
  viewBox?: string;
  opacity?: number;
}
```

Extends SVG props with icon-specific variant props.

### `iconVariants`

```typescript
const iconVariants: ReturnType<typeof tv>
```

Tailwind variants for icon color styling.

### Individual Icons

All icon components extend `BaseIcon` and accept the same props. Examples:

- `CloseIcon`, `CheckIcon`, `PlusIcon`, `EditIcon`
- `ChevronDownIcon`, `ChevronUpIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- `CaretUpIcon`, `CaretDownIcon`, `CaretLeftIcon`, `CaretRightIcon`
- `ArrowLeftRightIcon`, `ArrowDownUpIcon`
- `TradingIcon`, `MarketsIcon`, `VaultsIcon`
- And many more...

## Props & Behavior

### BaseIcon Props

#### `size`

```typescript
size?: number
```

Icon size in pixels. Default: `24`.

#### `color`

```typescript
color?: "primary" | "success" | "danger" | "warning" | "white" | "black" | "inherit"
```

Icon color variant. Default: `"black"`.

#### `viewBox`

```typescript
viewBox?: string
```

SVG viewBox. Default: `"0 0 24 24"`.

#### `opacity`

```typescript
opacity?: number
```

Icon opacity (0-1).

#### `fill`

```typescript
fill?: string
```

SVG fill color. Default: `"none"`.

#### `stroke`

```typescript
stroke?: string
```

SVG stroke color.

#### `className`

```typescript
className?: string
```

Additional CSS classes. Most icons inherit `currentColor`, so wrap them in text classes to change color.

#### `aria-label`

```typescript
aria-label?: string
```

Accessible label for the icon. Icons set `aria-hidden` by default; pass `aria-label` when they convey important meaning.

Inherits all standard SVG attributes.

## Usage Examples

### Basic Icon

```tsx
import { CloseIcon, CheckIcon } from "@veltodefi/ui";

<CloseIcon size={16} />
<CheckIcon size={20} color="success" />
```

### Icon with Color

```tsx
import { InfoCircleIcon } from "@veltodefi/ui";

<InfoCircleIcon className="oui-text-primary" />
<InfoCircleIcon color="danger" />
```

### Icon in Button

```tsx
import { Button, PlusIcon } from "@veltodefi/ui";

<Button leading={<PlusIcon size={16} />}>Add Item</Button>;
```

### Icon with Tooltip

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  InfoCircleIcon,
} from "@veltodefi/ui";

<Tooltip>
  <TooltipTrigger asChild>
    <InfoCircleIcon
      size={16}
      className="oui-text-base-contrast-54"
      aria-label="More information"
    />
  </TooltipTrigger>
  <TooltipContent>This is helpful information</TooltipContent>
</Tooltip>;
```

### Animated Icon

```tsx
import { RefreshIcon } from "@veltodefi/ui";

<RefreshIcon size={20} className={isLoading ? "oui-animate-spin" : ""} />;
```

## Implementation Notes

- Most icons inherit `currentColor`, so wrap them in text classes to change color (`className="oui-text-success"`)
- Brand icons with multiple fills maintain their palette internally; override by targeting child paths carefully if monochrome is needed
- Icons set `focusable={false}` and `aria-hidden` by default; pass `aria-label` when they convey important meaning
- All icons use consistent `viewBox` and sizing for alignment
- Icons are forward ref components, allowing ref forwarding for focus management

## Integration Tips

1. Pair icons with `Tooltip` when using them as standalone buttons (e.g., info icons).
2. For animated states (loading, rotating), apply Tailwind animations (`oui-animate-spin`) directly via `className`.
3. Keep asset additions centralized—new icons should leverage `BaseIcon` wrappers to stay consistent in size and accessibility.
4. Use `color` prop for semantic colors, or `className` with text color utilities for custom colors.
5. Always provide `aria-label` for icons that convey meaning without accompanying text.
