# Dropdown Reference

> Location: `packages/ui/src/dropdown/*.tsx`

## Overview

The Dropdown module builds on Radix DropdownMenu and provides menu primitives, checkbox/radio menu items, and token-aware list items with Orderly styling. It's used for action menus, preference selectors, and contextual operations throughout the app.

## Source Structure

| File             | Description                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dropdown.tsx`   | Core components (`Dropdown`, `DropdownTrigger`, `DropdownContent`, `DropdownItem`, `DropdownGroup`, `DropdownLabel`, `DropdownSeparator`, `dropdownMenuVariants`). |
| `menuItem.tsx`   | Higher-level item supporting icons, descriptions, and shortcuts (`MenuItem`, `SimpleDropdownMenu`).                                                                |
| `checkbox.tsx`   | `DropdownCheckboxItem` for multi-select menus.                                                                                                                     |
| `radioGroup.tsx` | Radio-style menu groups/items (`DropdownRadioGroup`, `DropdownRadioItem`).                                                                                         |
| `tokens.tsx`     | Token list item layout (icon + symbol + metadata).                                                                                                                 |
| `index.ts`       | Re-exports everything.                                                                                                                                             |

## Exports & Types

### `Dropdown` / `DropdownMenuRoot`

```typescript
const DropdownMenuRoot: typeof DropdownMenuPrimitive.Root
```

Root component for dropdown state management.

### `DropdownTrigger` / `DropdownMenuTrigger`

```typescript
const DropdownMenuTrigger: typeof DropdownMenuPrimitive.Trigger
```

Trigger element that opens the dropdown.

### `DropdownContent` / `DropdownMenuContent`

```typescript
const DropdownMenuContent: React.ForwardRefExoticComponent<
  DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>
>
```

Dropdown content container.

### `DropdownItem` / `DropdownMenuItem`

```typescript
const DropdownMenuItem: React.ForwardRefExoticComponent<
  DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>
>
```

Standard menu item.

### `DropdownCheckboxItem`

```typescript
const DropdownCheckboxItem: React.ForwardRefExoticComponent<
  DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>
>
```

Checkbox menu item for multi-select.

### `DropdownRadioGroup`, `DropdownRadioItem`

```typescript
const DropdownMenuRadioGroup: typeof DropdownMenuPrimitive.RadioGroup
const DropdownRadioItem: React.ForwardRefExoticComponent<...>
```

Radio group and radio items for single-select menus.

### `MenuItem`

```typescript
const MenuItem: React.FC<MenuItemProps>
```

Higher-level menu item with icon, label, description, and shortcut support.

### `SimpleDropdownMenu`

```typescript
const SimpleDropdownMenu: React.FC<PropsWithChildren<DropdownMenuProps>>
```

Simplified dropdown that accepts a menu array.

### `dropdownMenuVariants`

```typescript
const dropdownMenuVariants: ReturnType<typeof tv>
```

Tailwind variants for dropdown styling.

## Props & Behavior

### Dropdown Props

Inherits all Radix DropdownMenuRoot props:

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

#### `modal`

```typescript
modal?: boolean
```

Whether dropdown is modal. Default: `true`.

### DropdownContent Props

Inherits all Radix DropdownMenuContent props:

#### `side`

```typescript
side?: "top" | "right" | "bottom" | "left"
```

Side of trigger to show dropdown. Default: `"bottom"`.

#### `align`

```typescript
align?: "start" | "center" | "end"
```

Alignment relative to trigger. Default: `"start"`.

#### `sideOffset`

```typescript
sideOffset?: number
```

Distance from trigger. Default: `4`.

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Dropdown size variant.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

### DropdownItem Props

Inherits all Radix DropdownMenuItem props:

#### `onSelect`

```typescript
onSelect?: (event: Event) => void
```

Callback when item is selected.

#### `disabled`

```typescript
disabled?: boolean
```

Disable the item.

#### `size`

```typescript
size?: SizeType
```

Item size variant.

### MenuItem Props

#### `icon`

```typescript
icon?: React.ReactNode
```

Icon element.

#### `label`

```typescript
label: string;
```

Item label.

#### `description`

```typescript
description?: string
```

Item description.

#### `shortcut`

```typescript
shortcut?: string
```

Keyboard shortcut display.

#### `onSelect`

```typescript
onSelect?: (event: Event) => void
```

Callback when item is selected.

### SimpleDropdownMenu Props

#### `menu` (required)

```typescript
menu: MenuItem[]
```

Array of menu items.

#### `currentValue`

```typescript
currentValue?: string
```

Currently selected value.

#### `onSelect`

```typescript
onSelect?: (item: MenuItem) => void
```

Callback when item is selected.

#### `render`

```typescript
render?: (item: MenuItem, index: number) => ReactNode
```

Custom render function for items.

#### `size`

```typescript
size?: SizeType
```

Menu size variant.

## Usage Examples

### Basic Dropdown

```tsx
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@veltodefi/ui";

<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="outlined">Actions</Button>
  </DropdownTrigger>
  <DropdownContent align="end" sideOffset={8} className="oui-w-56">
    <DropdownItem onSelect={copyId}>Copy ID</DropdownItem>
    <DropdownItem onSelect={editItem}>Edit</DropdownItem>
    <DropdownItem onSelect={deleteItem} className="oui-text-danger">
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>;
```

### Dropdown with Checkbox Items

```tsx
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownCheckboxItem,
} from "@veltodefi/ui";

<Dropdown>
  <DropdownTrigger asChild>
    <Button>Filters</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownCheckboxItem
      checked={autoSubscribe}
      onCheckedChange={setAutoSubscribe}
    >
      Auto subscribe
    </DropdownCheckboxItem>
    <DropdownCheckboxItem
      checked={notifications}
      onCheckedChange={setNotifications}
    >
      Notifications
    </DropdownCheckboxItem>
  </DropdownContent>
</Dropdown>;
```

### Dropdown with MenuItem

```tsx
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  MenuItem,
} from "@veltodefi/ui";
import { CopyIcon, EditIcon, DeleteIcon } from "@veltodefi/ui";

<Dropdown>
  <DropdownTrigger asChild>
    <Button>Actions</Button>
  </DropdownTrigger>
  <DropdownContent>
    <MenuItem
      icon={<CopyIcon />}
      label="Copy ID"
      shortcut="⌘C"
      onSelect={copyId}
    />
    <MenuItem
      icon={<EditIcon />}
      label="Edit"
      description="Edit this item"
      onSelect={editItem}
    />
    <MenuItem
      icon={<DeleteIcon />}
      label="Delete"
      shortcut="⌘⌫"
      onSelect={deleteItem}
    />
  </DropdownContent>
</Dropdown>;
```

### SimpleDropdownMenu

```tsx
import { SimpleDropdownMenu } from "@veltodefi/ui";

<SimpleDropdownMenu
  menu={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ]}
  currentValue={selectedValue}
  onSelect={(item) => setSelectedValue(item.value)}
>
  <Button>Select</Button>
</SimpleDropdownMenu>;
```

## Implementation Notes

- Content areas can wrap `ScrollArea` to support long lists (token selectors, watchlists)
- Checkbox/radio items automatically render indicators using Orderly icons
- Separators (`DropdownSeparator`) and labels (`DropdownLabel`) are exported for multi-section menus
- Dropdown uses Radix primitives for accessibility, keyboard navigation, and focus management
- Default styling includes `oui-rounded-xl`, `oui-border-line-6`, `oui-bg-base-8`, `oui-shadow-md`

## Integration Tips

1. Pair Dropdown menu items with `Icon` components to improve scannability (use `MenuItem`).
2. Use `modal` mode cautiously—Dropdowns are best suited for lightweight interactions; use `Popover`/`Dialog` for form-heavy content.
3. Remember to provide keyboard shortcuts via `shortcut` prop or `aria-keyshortcuts` to communicate accelerator keys.
4. Use `SimpleDropdownMenu` for quick implementations with array-based menus.
5. Combine with `ScrollArea` inside `DropdownContent` for long option lists.
