# Sheet Reference

> Location: `packages/ui/src/sheet/*.tsx`

## Overview

Sheets implement drawer-style overlays powered by Radix Sheet. They support side/top/bottom placements and include helpers for common mobile patterns (`SimpleSheet`, `ActionSheet`).

## Source Structure

| File              | Description                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sheet.tsx`       | Primitive exports (`Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetBody`, `SheetClose`, `SheetOverlay`, `SheetPortal`, `sheetVariants`). |
| `simpleSheet.tsx` | Simplified API mirroring `SimpleDialog` but rendered as a sheet.                                                                                                     |
| `actionSheet.tsx` | Mobile action list (stacked buttons with destructive emphasis).                                                                                                      |
| `helper.tsx`      | Shared utilities.                                                                                                                                                    |
| `index.ts`        | Public exports.                                                                                                                                                      |

## Exports & Types

### `Sheet`

```typescript
const Sheet: typeof SheetPrimitive.Root
```

Root component for sheet state management.

### `SheetTrigger`

```typescript
const SheetTrigger: typeof SheetPrimitive.Trigger
```

Trigger element that opens the sheet.

### `SheetContent`

```typescript
const SheetContent: React.ForwardRefExoticComponent<
  SheetContentProps & React.RefAttributes<HTMLDivElement>
>
```

Sheet content container.

### `SheetHeader`, `SheetTitle`, `SheetBody`

```typescript
const SheetHeader: React.ForwardRefExoticComponent<...>
const SheetTitle: React.ForwardRefExoticComponent<...>
const SheetBody: React.ForwardRefExoticComponent<...>
```

Slot components for sheet structure.

### `SheetClose`, `SheetOverlay`, `SheetPortal`

```typescript
const SheetClose: typeof SheetPrimitive.Close
const SheetOverlay: React.ForwardRefExoticComponent<...>
const SheetPortal: typeof SheetPrimitive.Portal
```

Supporting components.

### `SimpleSheet`

```typescript
const SimpleSheet: React.FC<PropsWithChildren<SimpleSheetProps>>
```

High-level sheet wrapper with title and body.

### `ActionSheet`

```typescript
const ActionSheet: React.FC<ActionSheetProps>
```

Mobile action list component.

### `sheetVariants`

```typescript
const sheetVariants: ReturnType<typeof tv>
```

Tailwind variants for sheet styling.

### `SheetContentProps`

```typescript
interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  closeable?: boolean;
  onClose?: () => void;
  closeableSize?: number;
  closeOpacity?: number;
  closeClassName?: string;
  overlayClassName?: string;
}
```

### `SimpleSheetProps`

```typescript
interface SimpleSheetProps {
  title?: ReactNode | (() => ReactNode);
  leading?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  classNames?: {
    content?: string;
    body?: string;
    header?: string;
    overlay?: string;
  };
  contentProps?: SheetContentProps;
  closable?: boolean;
}
```

## Props & Behavior

### Sheet Props

Inherits all Radix SheetRoot props:

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

Whether sheet is modal. Default: `true`.

### SheetContent Props

#### `side`

```typescript
side?: "top" | "right" | "bottom" | "left"
```

Sheet placement. Default: `"bottom"`.

#### `closeable`

```typescript
closeable?: boolean
```

Show close button. Default: `true`.

#### `onClose`

```typescript
onClose?: () => void
```

Callback when close button is clicked.

#### `closeableSize`

```typescript
closeableSize?: number
```

Close button icon size. Default: `16`.

#### `closeOpacity`

```typescript
closeOpacity?: number
```

Close button opacity. Default: `0.98`.

#### `overlayClassName`

```typescript
overlayClassName?: string
```

Overlay class name.

### SimpleSheet Props

#### `title`

```typescript
title?: ReactNode | (() => ReactNode)
```

Sheet title.

#### `leading`

```typescript
leading?: React.ReactNode
```

Leading content in header (e.g., icon).

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
  header?: string;
  overlay?: string;
}
```

Class name overrides.

## Usage Examples

### Basic Sheet

```tsx
import { Sheet, SheetTrigger, SheetContent } from "@orderly.network/ui";

<Sheet>
  <SheetTrigger asChild>
    <Button>Open drawer</Button>
  </SheetTrigger>
  <SheetContent side="right" className="oui-w-[420px]">
    <SheetHeader>
      <SheetTitle>Notifications</SheetTitle>
    </SheetHeader>
    <SheetBody>...</SheetBody>
  </SheetContent>
</Sheet>;
```

### SimpleSheet

```tsx
import { SimpleSheet } from "@orderly.network/ui";

<SimpleSheet title="Settings" open={open} onOpenChange={setOpen}>
  <SettingsForm />
</SimpleSheet>;
```

### Bottom Sheet (Mobile)

```tsx
import { SimpleSheet } from "@orderly.network/ui";

<SimpleSheet
  title="Actions"
  open={open}
  onOpenChange={setOpen}
  contentProps={{ side: "bottom" }}
>
  <ActionList />
</SimpleSheet>;
```

### Sheet with Custom Header

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@orderly.network/ui";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right">
    <SheetHeader leading={<Icon />}>
      <SheetTitle>Custom Header</SheetTitle>
    </SheetHeader>
    <SheetBody>Content</SheetBody>
  </SheetContent>
</Sheet>;
```

## Implementation Notes

- Sheets use Radix Dialog primitives under the hood (same as Dialog)
- Default side is `"bottom"` for mobile-friendly interactions
- Content is rendered in a Portal to avoid z-index issues
- Animations use slide-in/out transitions based on `side` prop
- Overlay uses `oui-bg-black/80` for backdrop

## Integration Tips

1. Prefer sheets for mobile interactions; combine with `useScreen` to swap between `Dialog` on desktop and `Sheet` on mobile.
2. Use `ActionSheet` for destructive choices or share menus; supply a `danger` tone for irreversible actions.
3. Keep content scrollable by wrapping `SheetBody` with `ScrollArea` when necessary.
4. Use `side="bottom"` for mobile action sheets and `side="right"` for desktop sidebars.
5. Combine with `SimpleSheet` for quick implementations with title and body slots.
