# Select Reference

> Location: `packages/ui/src/select/*.tsx`

## Overview

Select components wrap Radix Select to provide searchable dropdowns, token selectors, and chain pickers. They include primitive exports plus higher-level builders for option arrays.

## Source Structure

| File                  | Description                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `select.tsx`          | Defines the generic `Select<T>` component using `SelectRoot`, `SelectTrigger`, and `SelectContent`.                       |
| `selectPrimitive.tsx` | Houses primitive exports (`SelectRoot`, `SelectTrigger`, `SelectContent`, `SelectValue`, `SelectItem`, `selectVariants`). |
| `withOptions.tsx`     | Helper to render options from an array.                                                                                   |
| `chains.tsx`          | Chain selector variant with icons/status.                                                                                 |
| `combine.tsx`         | Composition helpers for multi-select or cascaded selects.                                                                 |
| `tokens.tsx`          | Token list styling utilities.                                                                                             |
| `index.ts`            | Public exports (Select, SelectItem, SelectOption types, etc.).                                                            |

## Exports & Types

### `Select`

```typescript
const Select: <T>(props: PropsWithChildren<SelectProps<T>>) => JSX.Element
```

Generic select component with type-safe value handling.

### `SelectRoot`

```typescript
const SelectRoot: typeof SelectPrimitive.Root
```

Root component for select state management.

### `SelectTrigger`

```typescript
const SelectTrigger: React.ForwardRefExoticComponent<
  SelectTriggerProps & React.RefAttributes<HTMLButtonElement>
>
```

Trigger button that opens the select dropdown.

### `SelectContent`

```typescript
const SelectContent: React.ForwardRefExoticComponent<
  SelectContentProps & React.RefAttributes<HTMLDivElement>
>
```

Dropdown content container.

### `SelectValue`

```typescript
const SelectValue: typeof SelectPrimitive.Value
```

Displays the selected value or placeholder.

### `SelectItem`

```typescript
const SelectItem: React.ForwardRefExoticComponent<
  SelectItemProps & React.RefAttributes<HTMLDivElement>
>
```

Individual select option item.

### `selectVariants`

```typescript
const selectVariants: ReturnType<typeof tv>
```

Tailwind variants for select styling.

### `SelectProps`

```typescript
type SelectProps<T> = SelectPrimitive.SelectProps & {
  placeholder?: string;
  valueFormatter?: (
    value: T,
    options: { placeholder?: string },
  ) => React.ReactNode;
  contentProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
  showCaret?: boolean;
  maxHeight?: number;
  testid?: string;
  classNames?: {
    trigger?: string;
  };
} & SelectVariantProps;
```

### `SelectVariantProps`

```typescript
type SelectVariantProps = VariantProps<typeof selectVariants>;
```

Variant props for size, error, and variant.

## Props & Behavior

### Select Props

Inherits all Radix SelectRoot props:

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

#### `disabled`

```typescript
disabled?: boolean
```

Disable the select.

#### `placeholder`

```typescript
placeholder?: string
```

Placeholder text displayed when no value is selected.

#### `valueFormatter`

```typescript
valueFormatter?: (value: T, options: { placeholder?: string }) => React.ReactNode
```

Custom render function for the trigger. Allows rich content (icons, balances) in the trigger.

#### `contentProps`

```typescript
contentProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
```

Props passed to `SelectContent` (positioning, collision strategy).

#### `showCaret`

```typescript
showCaret?: boolean
```

Toggle the dropdown arrow icon. Default: `true`.

#### `maxHeight`

```typescript
maxHeight?: number
```

Restricts dropdown height (applied via wrapped `ScrollArea`).

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Select size variant.

#### `error`

```typescript
error?: boolean
```

Error state styling.

#### `variant`

```typescript
variant?: string
```

Select variant.

#### `classNames`

```typescript
classNames?: {
  trigger?: string;
}
```

Class name overrides.

## Usage Examples

### Basic Select

```tsx
import { Select, SelectItem } from "@veltodefi/ui";

<Select value={token} onValueChange={setToken} placeholder="Select token">
  {tokens.map((option) => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</Select>;
```

### Select with Custom Value Formatter

```tsx
import { Select, SelectItem } from "@veltodefi/ui";

<Select
  value={token}
  onValueChange={setToken}
  valueFormatter={(value, { placeholder }) => (
    <div className="oui-flex oui-items-center oui-gap-2">
      <TokenIcon symbol={value} />
      <span>{value || placeholder}</span>
    </div>
  )}
>
  {tokens.map((option) => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</Select>;
```

### Select with Max Height

```tsx
import { Select, SelectItem } from "@veltodefi/ui";

<Select value={chain} onValueChange={setChain} maxHeight={300}>
  {chains.map((chain) => (
    <SelectItem key={chain.id} value={chain.id}>
      {chain.name}
    </SelectItem>
  ))}
</Select>;
```

### Select with Error State

```tsx
import { Select, SelectItem } from "@veltodefi/ui";

<Select
  value={token}
  onValueChange={setToken}
  error={!isValid}
  placeholder="Select token"
>
  {tokens.map((option) => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</Select>;
```

## Implementation Notes

- Options live inside a `ScrollArea`, so long lists remain scrollable
- `SelectContent` automatically wraps children in `ScrollArea` for scrolling
- `valueFormatter` allows custom rendering while maintaining Radix accessibility
- Select uses Radix primitives for keyboard navigation and focus management

## Integration Tips

1. Use `valueFormatter` to display rich content (icons, balances) in the trigger while keeping Radix's accessibility intact.
2. Combine `Select` with `ListView` or virtualized lists inside `SelectContent` for massive option sets.
3. Provide `aria-label` or wrap with `TextField` when labels are necessary for screen readers.
4. Use `maxHeight` to control dropdown height for long option lists.
5. Use `contentProps` to customize positioning and collision handling.
