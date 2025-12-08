# Checkbox Reference

> Location: `packages/ui/src/checkbox/checkbox.tsx`

## Overview

`Checkbox` wraps Radix Checkbox primitives to provide consistent, theme-aware toggles for forms, table headers, and dropdown menus. It supports checked, unchecked, and indeterminate states with smooth indicator transitions and keyboard-friendly focus rings.

## Source Structure

| File           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `checkbox.tsx` | Declares the `Checkbox` component and indicator styling. |
| `index.ts`     | Re-exports `Checkbox`.                                   |

## Exports & Types

### `Checkbox`

```typescript
const Checkbox: React.ForwardRefExoticComponent<
  CheckboxProps & React.RefAttributes<HTMLButtonElement>
>
```

Checkbox component built on Radix UI primitives.

### `CheckboxProps`

```typescript
type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;
```

Extends Radix Checkbox props: `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `id`, `name`, `required`, `aria-*`, etc.

## Props & Behavior

#### `checked`

```typescript
checked?: boolean
```

Controlled checked state.

#### `defaultChecked`

```typescript
defaultChecked?: boolean
```

Uncontrolled default checked state.

#### `onCheckedChange`

```typescript
onCheckedChange?: (checked: boolean) => void
```

Callback when checked state changes.

#### `disabled`

```typescript
disabled?: boolean
```

Disable the checkbox.

**Note:** Indicator uses Orderly icons (e.g., check mark) and animates between `checked` and `indeterminate` states. Focus state applies `oui-ring` styles for keyboard visibility. Works seamlessly with form libraries (forwarded refs target the underlying button element).

## Usage

```tsx
import { Checkbox } from "@orderly.network/ui";

<label className="oui-flex oui-items-center oui-gap-2">
  <Checkbox id="notify" checked={value} onCheckedChange={setValue} />
  <span htmlFor="notify">Enable notifications</span>
</label>;
```

## Implementation Notes

- `data-state="indeterminate"` is exposed on the root element, allowing custom CSS or analytics hooks when partially selected.
- Combine with `Tooltip` or help text for complex permissions; `aria-describedby` can link the checkbox to explanatory copy.

## Integration Tips

1. In tables, set header checkbox `checked={allSelected}` and `onCheckedChange={toggleAll}`; use `indeterminate` when only some rows are selected.
2. For dropdown filters, pair `Checkbox` with `DropdownCheckboxItem` to ensure consistent spacing and indicator rendering.
3. Disable the checkbox when prerequisites aren’t met and add `aria-disabled="true"` to communicate the reason via tooltip or inline text.
