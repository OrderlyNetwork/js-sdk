# Typography Reference

> Location: `packages/ui/src/typography/*.tsx`

## Overview

Typography components handle text, numeric formatting, statistics, gradients, and symbol rendering. They keep font sizes, weights, and colors aligned with the design system while providing helpers for numeric data.

## Source Structure

| File            | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| `text.tsx`      | Base `Text` component with size, weight, color variants.            |
| `numeral.tsx`   | Number formatting component with precision, rounding, and coloring. |
| `statistic.tsx` | KPI-style component with label and value display.                   |
| `formatted.tsx` | Formatted text for dates, addresses, symbols, transaction IDs.      |
| `gradient.tsx`  | Gradient text wrapper with angle control.                           |
| `numType.tsx`   | Specialized numeric types (ROI, PnL, notional, etc.).               |
| `utils.ts`      | Formatting helpers (`parseNumber`, `formatAddress`).                |
| `index.ts`      | Export barrel with `Text` static methods.                           |

## Exports & Types

### `Text`

```typescript
const Text: React.ForwardRefExoticComponent<
  TextProps & React.RefAttributes<HTMLSpanElement>
> & {
  formatted: typeof FormattedText;
  numeral: typeof Numeral;
  gradient: typeof GradientText;
  roi: typeof NumTypeRoi;
  pnl: typeof NumTypePnl;
  notional: typeof NumTypeNotional;
  assetValue: typeof NumTypeAssetValue;
  collateral: typeof NumTypeCollateral;
}
```

Base text component with static methods for specialized text types.

### `textVariants`

```typescript
const textVariants: ReturnType<typeof tv>
```

Tailwind variants for text styling.

### `TextProps`

```typescript
type TextProps = BasicTextProps &
  (
    | ({ as?: "span" } & ComponentPropsWithout<"span", RemovedProps>)
    | ({ as: "div" } & ComponentPropsWithout<"div", RemovedProps>)
    | ({ as: "label" } & ComponentPropsWithout<"label", RemovedProps>)
    | ({ as: "p" } & ComponentPropsWithout<"p", RemovedProps>)
  );

interface BasicTextProps extends VariantProps<typeof textVariants> {
  asChild?: boolean;
}
```

Text component props. Supports rendering as `span`, `div`, `label`, or `p`.

### `Numeral`

```typescript
const Numeral: React.FC<NumeralProps>
```

Number formatting component.

### `NumeralProps`

```typescript
type NumeralProps = TextProps & {
  rule?: "percentages" | "price" | "human";
  dp?: number;
  ignoreDP?: boolean;
  tick?: number;
  rm?: RoundingMode;
  children: number | string;
  coloring?: boolean;
  loading?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  unit?: string;
  currency?: string;
  visible?: boolean;
  padding?: boolean;
  showIdentifier?: boolean;
  placeholder?: string;
  masking?: React.ReactNode | string;
  identifiers?: {
    loss?: React.ReactNode;
    profit?: React.ReactNode;
  };
};
```

### `Statistic` & `StatisticLabel`

```typescript
const Statistic: React.ForwardRefExoticComponent<
  StatisticProps & React.RefAttributes<HTMLDivElement>
>
const StatisticLabel: React.ForwardRefExoticComponent<
  StatisticLabelProps & React.RefAttributes<HTMLDivElement>
>
```

### `StatisticProps`

```typescript
type StatisticProps = VariantProps<typeof statisticVariants> &
  HTMLAttributes<HTMLDivElement> & {
    label: string | ReactNode;
    valueProps?: Omit<NumeralProps, "children">;
    classNames?: {
      root?: string;
      label?: string;
      value?: string;
    };
  };
```

### `FormattedText`

```typescript
const FormattedText: React.ForwardRefExoticComponent<
  FormattedTextProps & React.RefAttributes<HTMLSpanElement>
>
```

### `FormattedTextProps`

```typescript
type FormattedTextProps = TextProps &
  CopyableTextProps & {
    loading?: boolean;
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
    showIcon?: boolean;
  } & (
    | { rule: "date"; formatString?: string }
    | { rule: "address"; range?: [number, number] }
    | {
        rule: "symbol";
        formatString?: string;
        showIcon?: boolean;
        iconSize?: SizeType;
      }
    | { rule: "txId"; range?: [number, number] }
    | { rule: Omit<TextRule, "address" | "date">; capitalize?: boolean }
    | { rule?: string }
  );
```

### `GradientText`

```typescript
const GradientText: React.ForwardRefExoticComponent<
  GradientTextProps & React.RefAttributes<HTMLSpanElement>
>
```

### `GradientTextProps`

```typescript
type GradientTextProps = Omit<TextProps, "color"> &
  VariantProps<typeof gradientTextVariants> & {
    angle?: number;
  };
```

### Utility Functions

```typescript
function parseNumber(
  value: number | string,
  options?: {
    rule?: "percentages" | "price" | "human";
    dp?: number;
    tick?: number;
    rm?: RoundingMode;
    padding?: boolean;
    abs?: boolean;
  },
): string;

function formatAddress(address: string, range?: [number, number]): string;
```

## Props & Behavior

### Text Props

#### `size`

```typescript
size?: "3xs" | "2xs" | "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
```

Font size variant.

#### `weight`

```typescript
weight?: "regular" | "semibold" | "bold"
```

Font weight.

#### `color`

```typescript
color?: "inherit" | "neutral" | "primary" | "primaryLight" | "secondary" | "tertiary" |
       "warning" | "danger" | "success" | "buy" | "sell" | "lose" | "withdraw" |
       "profit" | "deposit"
```

Text color variant.

#### `intensity`

```typescript
intensity?: 12 | 20 | 36 | 54 | 80 | 98
```

Opacity level for base-contrast colors (e.g., `oui-text-base-contrast-54`).

#### `as`

```typescript
as?: "span" | "div" | "label" | "p"
```

HTML element to render. Default: `"span"`.

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix Slot to merge props with child element.

### Numeral Props

#### `rule`

```typescript
rule?: "percentages" | "price" | "human"
```

Formatting rule. Default: `"price"`.

#### `dp`

```typescript
dp?: number
```

Decimal places. Default: `2`.

#### `tick`

```typescript
tick?: number
```

Tick size for price formatting (e.g., `0.00001`). Used to calculate decimal places if `dp` is not provided.

#### `rm`

```typescript
rm?: RoundingMode
```

Rounding mode. Options: `Decimal.ROUND_UP`, `Decimal.ROUND_DOWN`, `Decimal.ROUND_HALF_UP`, `"truncate"`. Default: `Decimal.ROUND_DOWN`.

#### `coloring`

```typescript
coloring?: boolean
```

Automatically color based on value (green for positive, red for negative, neutral for zero).

#### `showIdentifier`

```typescript
showIdentifier?: boolean
```

Show `+` or `-` sign before the number.

#### `visible`

```typescript
visible?: boolean
```

If `false`, displays masking (default: `"*****"`).

#### `padding`

```typescript
padding?: boolean
```

Pad with zeros. Default: `true`.

### FormattedText Props

#### `rule`

```typescript
rule?: "date" | "address" | "symbol" | "status" | "txId" | string
```

Formatting rule type.

#### `copyable`

```typescript
copyable?: boolean
```

Show copy button. Clicking copies the text to clipboard.

#### `onCopy`

```typescript
onCopy?: (event: React.MouseEvent<HTMLButtonElement>) => void
```

Callback when text is copied.

## Usage Examples

### Basic Text

```tsx
import { Text } from "@orderly.network/ui";

<Text size="lg" weight="bold" color="primary">
  Heading
</Text>

<Text size="sm" color="neutral" intensity={54}>
  Secondary text
</Text>
```

### Semantic HTML

```tsx
import { Text } from "@orderly.network/ui";

<Text as="h2" size="2xl" weight="bold">
  Section Title
</Text>

<Text as="p" size="base" color="neutral">
  Paragraph text
</Text>
```

### Number Formatting

```tsx
import { Text } from "@orderly.network/ui";

<Text.numeral rule="price" dp={2} coloring>
  12345.678
</Text.numeral>

<Text.numeral rule="percentages" dp={4} showIdentifier>
  0.0023
</Text.numeral>

<Text.numeral
  rule="human"
  dp={2}
  unit="USD"
  prefix="$"
>
  1000000
</Text.numeral>
```

### Formatted Text

```tsx
import { Text } from "@orderly.network/ui";

<Text.formatted rule="date" formatString="yyyy-MM-dd">
  {new Date()}
</Text.formatted>

<Text.formatted rule="address" range={[6, 4]}>
  0x1234567890abcdef1234567890abcdef12345678
</Text.formatted>

<Text.formatted
  rule="symbol"
  formatString="base-quote"
  showIcon
  iconSize="sm"
>
  PERP_ETH_USDC
</Text.formatted>

<Text.formatted rule="txId" copyable onCopy={() => console.log("Copied!")}>
  0xabcdef1234567890abcdef1234567890abcdef12
</Text.formatted>
```

### Gradient Text

```tsx
import { Text } from "@orderly.network/ui";

<Text.gradient color="brand" size="2xl" weight="bold" angle={90}>
  Gradient Heading
</Text.gradient>;
```

### Statistics

```tsx
import { Text, Statistic } from "@orderly.network/ui";

<Statistic
  label="Total Balance"
  valueProps={{ rule: "price", dp: 2, coloring: true }}
>
  12345.67
</Statistic>

<Statistic
  label="ROI"
  valueProps={{ rule: "percentages", dp: 2, showIdentifier: true }}
  align="end"
>
  0.0234
</Statistic>
```

### Specialized Number Types

```tsx
import { Text } from "@orderly.network/ui";

<Text.roi dp={4} coloring>
  0.0234
</Text.roi>

<Text.pnl dp={2} coloring showIdentifier>
  -1234.56
</Text.pnl>

<Text.notional dp={0}>
  1000000
</Text.notional>
```

## Implementation Notes

- `Text` uses Radix `Slot` for `asChild` support, allowing props to be merged with child elements
- `Numeral` uses `Decimal.js` for precise number formatting and rounding
- `FormattedText` uses `date-fns` for date formatting
- All text components support responsive variants through `tailwind-variants`
- `coloring` prop in `Numeral` automatically applies color based on value sign
- `Statistic` automatically wraps numeric children in `Numeral` if they're strings or numbers

## Integration Tips

1. Use `Text.asChild` to render semantic HTML tags while maintaining design system styling.
2. Use `Text.numeral` for all numeric displays to ensure consistent formatting across the application.
3. Use `coloring` prop for PnL, ROI, and other value-based displays to automatically show profit/loss colors.
4. Use `Text.formatted` for addresses, dates, and symbols to avoid duplicating formatting logic.
5. Combine `Statistic` with `Numeral` for dashboard KPIs to maintain consistent label/value styling.
6. Use `tick` prop in `Numeral` when formatting prices to automatically calculate correct decimal places from market data.
7. Use `Text.gradient` sparingly for marketing content and hero sections.
