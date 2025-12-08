# Radio Reference

> Location: `packages/ui/src/radio/radio.tsx`, `packages/ui/src/radio/index.ts`

## Overview

`RadioGroup` wraps Radix Radio primitives to deliver theme-aligned single-selection controls. It supports horizontal or vertical stacks, disabled states, and keyboard navigation out of the box.

## Source Structure

| File        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `radio.tsx` | Exports `RadioGroup`, `RadioGroupItem`, and `radioVariants`. |
| `index.ts`  | Re-exports the API.                                          |

## Exports & Types

### `RadioGroup`

```typescript
const RadioGroup: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> &
    React.RefAttributes<HTMLDivElement>
>
```

Radio group container component.

### `RadioGroupItem`

```typescript
const RadioGroupItem: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    React.RefAttributes<HTMLButtonElement>
>
```

Individual radio button item.

### `radioVariants`

```typescript
const radioVariants: ReturnType<typeof tv>
```

Tailwind variants for radio styling.

## Props & Behavior

### RadioGroup Props

Inherits all Radix RadioGroup props:

#### `value`

```typescript
value?: string
```

Controlled selected value.

#### `defaultValue`

```typescript
defaultValue?: string
```

Uncontrolled default selected value.

#### `onValueChange`

```typescript
onValueChange?: (value: string) => void
```

Callback when selected value changes.

#### `orientation`

```typescript
orientation?: "horizontal" | "vertical"
```

Layout direction. Default: `"vertical"`.

#### `disabled`

```typescript
disabled?: boolean
```

Disable all radio items in the group.

#### `name`

```typescript
name?: string
```

Form field name for the radio group.

### RadioGroupItem Props

Inherits all Radix RadioItem props:

#### `value` (required)

```typescript
value: string;
```

Value for this radio item.

#### `id`

```typescript
id?: string
```

Element ID.

#### `disabled`

```typescript
disabled?: boolean
```

Disable this specific radio item.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

## Usage Examples

### Basic Radio Group

```tsx
import { RadioGroup, RadioGroupItem } from "@orderly.network/ui";

<RadioGroup value={mode} onValueChange={setMode} className="oui-flex oui-gap-4">
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="isolated" id="isolated" />
    <span>Isolated</span>
  </label>
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="cross" id="cross" />
    <span>Cross</span>
  </label>
</RadioGroup>;
```

### Horizontal Radio Group

```tsx
import { RadioGroup, RadioGroupItem } from "@orderly.network/ui";

<RadioGroup
  value={theme}
  onValueChange={setTheme}
  orientation="horizontal"
  className="oui-flex oui-gap-4"
>
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="light" id="light" />
    <span>Light</span>
  </label>
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="dark" id="dark" />
    <span>Dark</span>
  </label>
</RadioGroup>;
```

### Disabled Radio Item

```tsx
import { RadioGroup, RadioGroupItem } from "@orderly.network/ui";

<RadioGroup value={option} onValueChange={setOption}>
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="enabled" id="enabled" />
    <span>Enabled</span>
  </label>
  <label className="oui-flex oui-items-center oui-gap-2">
    <RadioGroupItem value="disabled" id="disabled" disabled />
    <span>Disabled</span>
  </label>
</RadioGroup>;
```

## Implementation Notes

- Radio items use a check icon indicator that appears when selected
- Focus state applies ring styles for keyboard visibility
- Disabled items have reduced opacity and cursor-not-allowed
- Radio group uses grid layout with gap for spacing

## Integration Tips

1. Combine with `ListView` rows by rendering `RadioGroupItem` via `asChild` to make entire rows selectable.
2. For large sets, wrap the group in `ScrollArea` to maintain fixed height.
3. Ensure each `RadioGroupItem` is associated with text via `<label>` or `aria-labelledby` to keep screen readers informed.
4. Use `orientation="horizontal"` for inline radio groups in forms or toolbars.
5. Group related options logically and use descriptive labels for accessibility.
