# Slider Reference

> Location: `packages/ui/src/slider/slider.tsx`, `packages/ui/src/slider/utils.ts`, `packages/ui/src/slider/index.ts`

## Overview

`Slider` wraps Radix Slider to provide branded track/thumb styling, tooltip support, and helper utilities for value formatting. It works for both single-value and range sliders.

## Source Structure

| File         | Description                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slider.tsx` | Exports slider components (`BaseSlider`, `Slider`, `SliderTrack`, `SliderThumb`, `SliderRange`, `Marks`), `SliderProps`, `SliderMarks`, and `sliderVariants`. |
| `utils.ts`   | Math helpers (`convertValueToPercentage`, `getThumbInBoundsOffset`) for percentages, ranges, and tick marks.                                                  |
| `index.ts`   | Re-exports slider APIs.                                                                                                                                       |

## Exports & Types

### `Slider` / `BaseSlider`

```typescript
const BaseSlider: React.ForwardRefExoticComponent<
  SliderProps & React.RefAttributes<HTMLSpanElement>
>
```

Slider component with track, thumb, range, and optional marks/tooltips.

### `sliderVariants`

```typescript
const sliderVariants: ReturnType<typeof tv>
```

Tailwind variants for slider styling.

### `SliderProps`

```typescript
type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderVariants> & {
    marks?: SliderMarks;
    markCount?: number;
    markLabelVisible?: boolean;
    showTip?: boolean;
    tipFormatter?: (
      value: number,
      min: number,
      max: number,
      percent: number,
    ) => string | React.ReactNode;
    classNames?: {
      root?: string;
      thumb?: string;
      track?: string;
      range?: string;
    };
  };
```

### `SliderMarks`

```typescript
type SliderMarks = { value: number; label: string }[];
```

Array of mark objects with value and label.

## Props & Behavior

### Slider Props

Inherits all Radix SliderRoot props:

#### `value`

```typescript
value?: number[]
```

Controlled value(s). Single value: `[50]`. Range: `[25, 75]`.

#### `defaultValue`

```typescript
defaultValue?: number[]
```

Uncontrolled default value(s).

#### `min`

```typescript
min?: number
```

Minimum value. Default: `0`.

#### `max`

```typescript
max?: number
```

Maximum value. Default: `100`.

#### `step`

```typescript
step?: number
```

Step increment. Default: `1`.

#### `onValueChange`

```typescript
onValueChange?: (value: number[]) => void
```

Callback when value changes during drag.

#### `onValueCommit`

```typescript
onValueCommit?: (value: number[]) => void
```

Callback when value is committed (on release).

#### `disabled`

```typescript
disabled?: boolean
```

Disable the slider.

#### `color`

```typescript
color?: "primary" | "primaryLight" | "buy" | "sell"
```

Slider color variant. Default: `"primary"`.

#### `marks`

```typescript
marks?: SliderMarks
```

Custom marks array. If not provided and `markCount` is set, marks are auto-generated.

#### `markCount`

```typescript
markCount?: number
```

Number of marks to auto-generate. If `marks` is provided, this is ignored.

#### `markLabelVisible`

```typescript
markLabelVisible?: boolean
```

Show labels on marks. Default: `false`.

#### `showTip`

```typescript
showTip?: boolean
```

Show tooltip on thumb. Default: `false`.

#### `tipFormatter`

```typescript
tipFormatter?: (value: number, min: number, max: number, percent: number) => string | React.ReactNode
```

Custom formatter for tooltip content. Default shows numeric value.

#### `classNames`

```typescript
classNames?: {
  root?: string;
  thumb?: string;
  track?: string;
  range?: string;
}
```

Class name overrides for slider components.

## Usage Examples

### Basic Slider

```tsx
import { Slider } from "@veltodefi/ui";

<Slider
  value={[rate]}
  onValueChange={(value) => setRate(value[0])}
  min={0}
  max={100}
  step={1}
/>;
```

### Slider with Marks

```tsx
import { Slider } from "@veltodefi/ui";

<Slider
  value={[rate]}
  onValueChange={(value) => setRate(value[0])}
  min={0}
  max={100}
  marks={[0, 25, 50, 75, 100]}
  markLabelVisible={true}
/>;
```

### Slider with Tooltip

```tsx
import { Slider } from "@veltodefi/ui";

<Slider
  value={[rate]}
  onValueChange={(value) => setRate(value[0])}
  min={0}
  max={100}
  showTip={true}
  tipFormatter={(val) => `${val}%`}
/>;
```

### Range Slider

```tsx
import { Slider } from "@veltodefi/ui";

<Slider
  value={[min, max]}
  onValueChange={(value) => {
    setMin(value[0]);
    setMax(value[1]);
  }}
  min={0}
  max={100}
  showTip={true}
/>;
```

### Slider with Auto-Generated Marks

```tsx
import { Slider } from "@veltodefi/ui";

<Slider
  value={[rate]}
  onValueChange={(value) => setRate(value[0])}
  min={0}
  max={100}
  markCount={5}
  markLabelVisible={true}
/>;
```

### Color Variants

```tsx
import { Slider } from "@veltodefi/ui";

<Slider color="buy" value={[50]} />
<Slider color="sell" value={[50]} />
<Slider color="primaryLight" value={[50]} />
```

## Implementation Notes

- Slider uses Radix primitives for accessibility and keyboard navigation
- Tooltip appears on focus/hover when `showTip` is `true`
- Marks can be custom (`marks` prop) or auto-generated (`markCount` prop)
- Range sliders support multiple thumbs by passing arrays to `value`/`defaultValue`
- Thumb size increases on focus for better visibility
- Disabled state hides thumb and uses muted colors

## Integration Tips

1. Pair sliders with `Input` fields to allow numeric entry alongside drag adjustments.
2. For range selection, supply two values (e.g., `[min, max]`) and render tooltips per thumb.
3. Customize `marks` to highlight thresholds (liquidation levels, warning zones) and style them via CSS modules if needed.
4. Use `tipFormatter` to format values as percentages, currency, or other formats.
5. Combine with `Text` or `Numeral` to display the current value outside the slider.
