# Input Family Reference

> Location: `packages/ui/src/input/*.tsx`

## Overview

The input folder provides a cohesive set of text inputs, text areas, tooltip-enhanced fields, and supporting components (prefix/suffix, helper text, formatters). It standardizes padding, font sizes, and validation visuals across forms.

## Source Structure

| File                                              | Description                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `baseInput.tsx`                                   | Layout scaffold for labels, descriptions, prefix/suffix containers (`BaseInput`, `BaseInputProps`).                |
| `input.tsx`                                       | Core `Input` component with size/status/prefix/suffix props (`Input`, `inputVariants`, `InputProps`).              |
| `textField.tsx`                                   | High-level wrapper combining label, description, help/error text, and child input (`TextField`, `TextFieldProps`). |
| `textarea.tsx`                                    | Multi-line input component (`Textarea`, `TextareaProps`).                                                          |
| `inputAdditional.tsx`, `prefix.tsx`, `suffix.tsx` | Helpers managing accessory slots (`InputAdditional`, `InputPrefix`, `InputSuffix`).                                |
| `input.tooltip.tsx`                               | Input variant that automatically shows a tooltip (`InputWithTooltip`, `InputWithTooltipProps`).                    |
| `inputHelpText.tsx`                               | Renders contextual help/error messages (`InputHelpText`, `InputHelpTextProps`).                                    |
| `formatter/*.ts`                                  | Formatter interface and helpers (`InputFormatter`, `inputFormatter`).                                              |
| `index.ts`                                        | Public exports.                                                                                                    |

## Exports & Types

### `Input`

```typescript
const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
>
```

Core input component with size, status, prefix, and suffix support.

### `TextField`

```typescript
const TextField: React.ForwardRefExoticComponent<
  TextFieldProps & React.RefAttributes<HTMLDivElement>
>
```

High-level wrapper combining label, description, help/error text, and child input.

### `Textarea`

```typescript
const Textarea: React.ForwardRefExoticComponent<
  TextareaProps & React.RefAttributes<HTMLTextAreaElement>
>
```

Multi-line textarea component.

### `InputWithTooltip`

```typescript
const InputWithTooltip: React.ForwardRefExoticComponent<
  InputWithTooltipProps & React.RefAttributes<HTMLInputElement>
>
```

Input variant that automatically shows a tooltip.

### `InputHelpText`

```typescript
const InputHelpText: React.ForwardRefExoticComponent<
  InputHelpTextProps & React.RefAttributes<HTMLDivElement>
>
```

Component for rendering help/error messages.

### `inputVariants`

```typescript
const inputVariants: ReturnType<typeof tv>
```

Tailwind variants for input styling.

### `InputProps`

```typescript
interface InputProps<T = string>
  extends BaseInputProps<T>,
    VariantProps<typeof inputVariants> {
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  fullWidth?: boolean;
  onClear?: () => void;
  classNames?: {
    input?: string;
    root?: string;
    additional?: string;
    clearButton?: string;
    prefix?: string;
    suffix?: string;
  };
}
```

### `TextFieldProps`

```typescript
type TextFieldProps = InputProps & {
  label: string;
  helpText?: string;
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
  };
} & VariantProps<typeof textFieldVariants>;
```

## Props & Behavior

### Input Props

Inherits all standard `HTMLInputElement` attributes:

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Input size variant. Default: `"lg"`.

#### `color`

```typescript
color?: "default" | "success" | "danger" | "warning"
```

Input status color. `"default"` shows normal state; others show validation states.

#### `prefix`

```typescript
prefix?: string | React.ReactNode
```

Content to display before the input (e.g., icon, currency symbol).

#### `suffix`

```typescript
suffix?: string | React.ReactNode
```

Content to display after the input (e.g., unit, button).

#### `fullWidth`

```typescript
fullWidth?: boolean
```

Make input full width. Default: `false`.

#### `onClear`

```typescript
onClear?: () => void
```

Callback when clear button is clicked. Shows clear button when provided.

#### `align`

```typescript
align?: "left" | "center" | "right"
```

Text alignment. Default: `"left"`.

#### `disabled`

```typescript
disabled?: boolean
```

Disable the input.

#### `readOnly`

```typescript
readOnly?: boolean
```

Make input read-only.

#### `classNames`

```typescript
classNames?: {
  input?: string;
  root?: string;
  additional?: string;
  clearButton?: string;
  prefix?: string;
  suffix?: string;
}
```

Class name overrides for input parts.

### TextField Props

#### `label` (required)

```typescript
label: string;
```

Field label text.

#### `helpText`

```typescript
helpText?: string
```

Helper text displayed below the input.

#### `direction`

```typescript
direction?: "column" | "row"
```

Layout direction. Default: `"column"`.

Inherits all `InputProps`.

### Textarea Props

Inherits all standard `HTMLTextAreaElement` attributes.

## Usage Examples

### Basic Input

```tsx
import { Input } from "@orderly.network/ui";

<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text"
/>;
```

### Input with Prefix/Suffix

```tsx
import { Input } from "@orderly.network/ui";

<Input
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  prefix="$"
  suffix="USD"
/>;
```

### Input with Status

```tsx
import { Input } from "@orderly.network/ui";

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  color={hasError ? "danger" : isValid ? "success" : "default"}
/>;
```

### TextField

```tsx
import { Input, TextField } from "@orderly.network/ui";

<TextField
  label="Order size"
  description="Enter amount in base asset"
  helpText={error || "Minimum 10"}
>
  <Input
    type="number"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    color={error ? "danger" : "default"}
  />
</TextField>;
```

### Input with Clear Button

```tsx
import { Input } from "@orderly.network/ui";

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onClear={() => setValue("")}
/>;
```

### Input with Formatter

```tsx
import { Input, inputFormatter } from "@orderly.network/ui";

<Input
  value={value}
  onChange={(e) => setValue(inputFormatter.number.format(e.target.value))}
  onBlur={(e) => setValue(inputFormatter.number.parse(e.target.value))}
/>;
```

## Implementation Notes

- Prefix/suffix wrappers automatically adjust padding and apply separators so inputs do not collapse when accessories are absent
- Formatters run during `onChange` (`format`) and `onBlur` (`parse`), ensuring both display and stored values stay consistent
- `TextField` exposes `classNames` to override root/input/body styles if necessary
- Input uses `tailwind-variants` for styling with slots (`input`, `box`, `additional`, `closeButton`)
- Clear button appears when `onClear` is provided and input has focus

## Integration Tips

1. Combine `Input` with `Tooltip` or `InputWithTooltip` to explain complex formatting requirements (e.g., leverage).
2. Reuse `InputAdditional` to place buttons or spinners inside validated fields (e.g., OTP send/resend).
3. Hook inputs to `react-hook-form` or `Formik`; refs are forwarded to the actual `<input>` element for easy registration.
4. Use `color` prop for validation states (success, danger, warning).
5. Use `TextField` for complete form fields with labels and help text.
