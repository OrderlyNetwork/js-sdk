# Dialog System Reference

> Location: `packages/ui/src/dialog/*.tsx`

## Overview

The dialog subsystem wraps Radix Dialog to deliver modal windows with consistent styling and behavior. It includes:

- Primitive exports that mirror Radix components (`Dialog`, `DialogTrigger`, `DialogContent`, etc.).
- `SimpleDialog`, which bundles title/body/footer sections and class overrides.
- `SimpleDialogFooter`, which renders action buttons based on a `DialogAction` map.
- `AlertDialog` and `TriggerDialog`, specialized abstractions for confirmations or self-managed triggers.
- Helper utilities for portals and focus management.

## Source Structure

| File                     | Description                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dialog.tsx`             | Re-exports Radix primitives with theme-aware classes (`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose`). |
| `simpleDialog.tsx`       | Provides `SimpleDialog` wrapper with header/body/footer slots.                                                                                                                                      |
| `simpleDialogFooter.tsx` | Defines `DialogAction` and renders button sets.                                                                                                                                                     |
| `alertDialog.tsx`        | Ready-made confirmation dialog (see `doc/alert/alert.md`).                                                                                                                                          |
| `triggerDialog.tsx`      | Internal stateful dialog with built-in trigger handling.                                                                                                                                            |
| `helper.tsx`             | Portal + container helpers.                                                                                                                                                                         |
| `index.ts`               | Aggregate exports.                                                                                                                                                                                  |

## Exports & Types

### `Dialog`

```typescript
const Dialog: typeof DialogPrimitive.Root
```

Root component for dialog state management.

### `DialogTrigger`

```typescript
const DialogTrigger: typeof DialogPrimitive.Trigger
```

Trigger element that opens the dialog.

### `DialogContent`

```typescript
const DialogContent: React.ForwardRefExoticComponent<
  DialogContentProps & React.RefAttributes<HTMLDivElement>
>
```

Dialog content container.

### `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`

```typescript
const DialogHeader: React.ForwardRefExoticComponent<...>
const DialogTitle: React.ForwardRefExoticComponent<...>
const DialogDescription: React.ForwardRefExoticComponent<...>
const DialogBody: React.ForwardRefExoticComponent<...>
const DialogFooter: React.ForwardRefExoticComponent<...>
```

Slot components for dialog structure.

### `DialogClose`

```typescript
const DialogClose: typeof DialogPrimitive.Close
```

Close button component.

### `SimpleDialog`

```typescript
const SimpleDialog: React.FC<PropsWithChildren<SimpleDialogProps>>
```

High-level dialog wrapper with title, body, and footer.

### `SimpleDialogProps`

```typescript
type SimpleDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  closable?: boolean;
  title?: ReactNode | (() => ReactNode);
  description?: ReactNode;
  classNames?: {
    content?: string;
    body?: string;
    footer?: string;
    overlay?: string;
  };
  contentProps?: DialogContentProps;
} & SimpleDialogFooterProps;
```

### `DialogContentProps`

```typescript
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  closable?: boolean;
  overlyClassName?: string;
}
```

## Props & Behavior

### Dialog Props

Inherits all Radix DialogRoot props:

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

Whether dialog is modal. Default: `true`.

### SimpleDialog Props

#### `title`

```typescript
title?: ReactNode | (() => ReactNode)
```

Dialog title. Can be a React node or a function that returns one.

#### `description`

```typescript
description?: ReactNode
```

Dialog description text.

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Dialog size. Default sizes adapt to screen (`useScreen` picks `xs` on mobile, `sm` on desktop).

#### `closable`

```typescript
closable?: boolean
```

Show close button. Default: `true`.

#### `classNames`

```typescript
classNames?: {
  content?: string;
  body?: string;
  footer?: string;
  overlay?: string;
}
```

Class name overrides for dialog slots.

#### `contentProps`

```typescript
contentProps?: DialogContentProps
```

Additional props for `DialogContent`.

#### `actions`

```typescript
actions?: {
  primary?: Partial<DialogAction>;
  secondary?: Partial<DialogAction>;
}
```

Action buttons configuration (see `SimpleDialogFooter`).

### DialogContent Props

#### `size`

```typescript
size?: "xs" | "sm" | "md" | "lg" | "xl"
```

Dialog size variant.

#### `closable`

```typescript
closable?: boolean
```

Show close button.

#### `overlyClassName`

```typescript
overlyClassName?: string
```

Overlay class name.

Inherits all Radix DialogContent props: `side`, `align`, `sideOffset`, etc.

## Usage Examples

### Basic Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@orderly.network/ui";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <DialogBody>Dialog content here</DialogBody>
  </DialogContent>
</Dialog>;
```

### SimpleDialog

```tsx
import { SimpleDialog } from "@orderly.network/ui";

<SimpleDialog
  title="Settings"
  open={open}
  onOpenChange={setOpen}
  actions={{
    secondary: { label: "Cancel" },
    primary: { label: "Save", onClick: handleSave },
  }}
>
  <SettingsForm />
</SimpleDialog>;
```

### Dialog with Custom Size

```tsx
import { SimpleDialog } from "@orderly.network/ui";

<SimpleDialog title="Large Dialog" size="xl" open={open} onOpenChange={setOpen}>
  <LargeContent />
</SimpleDialog>;
```

### Dialog with Custom Footer

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@orderly.network/ui";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Custom Dialog</DialogTitle>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter>
      <Button variant="outlined">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## Implementation Notes

- Default sizes adapt to screen (`useScreen` picks `xs` on mobile, `sm` on desktop) but can be overridden
- `SimpleDialog` merges `classNames` with defaults using `cnBase`, letting consumers remove padding or change backgrounds as needed
- `TriggerDialog` manages its own `open` state, ideal for small features where state hoisting is unnecessary
- Dialog uses Radix primitives for accessibility, focus management, and keyboard navigation
- Content is rendered in a Portal to avoid z-index issues

## Integration Tips

1. Compose with the modal system (`packages/ui/src/modal`) to launch dialogs via `modalActions.show` when you prefer a promise-based API.
2. Override `SimpleDialog` slot classes for complex layouts—e.g., `classNames.body="!oui-pb-0"` to embed a scrollable list.
3. Use `DialogAction.loading` to show busy states instead of disabling the entire dialog.
4. For nested dialogs or sheets, prefer `Sheet` on mobile to avoid double overlays and focus traps.
5. Use `contentProps` to customize positioning and collision handling.
