# Collapsible Reference

> Location: `packages/ui/src/collapsible/collapsible.tsx`, `packages/ui/src/collapsible/collapse/collapse.tsx`, `packages/ui/src/collapsible/index.ts`

## Overview

The Collapsible module wraps Radix Collapsible to create expandable panels used in settings sections, FAQs, and price breakdowns. It provides both low-level primitives (`Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`) with built-in animations and a higher-level `Collapse` component for common layouts.

## Source Structure

| File                    | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `collapsible.tsx`       | Exports Radix-based primitives with Orderly styling.                   |
| `collapse/collapse.tsx` | Higher-level `Collapse` component (title, description, icon, content). |
| `index.ts`              | Public exports for both implementations.                               |

## Exports & Types

### `Collapsible`

```typescript
const Collapsible: typeof CollapsiblePrimitive.Root
```

Root component for collapsible state management.

### `CollapsibleTrigger`

```typescript
const CollapsibleTrigger: typeof CollapsiblePrimitive.CollapsibleTrigger
```

Trigger element that toggles the collapsible content.

### `CollapsibleContent`

```typescript
const CollapsibleContent: React.FC<CollapsiblePrimitive.CollapsibleContentProps>
```

Content container that expands/collapses with animations.

### `Collapse`

```typescript
const Collapse: React.FC<CollapseProps>
```

Higher-level component with title, description, and icon support.

## Props & Behavior

### Collapsible Props

Inherits all Radix CollapsibleRoot props:

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

#### `disabled`

```typescript
disabled?: boolean
```

Disable the collapsible.

### CollapsibleTrigger Props

Inherits all Radix CollapsibleTrigger props:

#### `asChild`

```typescript
asChild?: boolean
```

Use Radix `Slot` to merge props with child element.

### CollapsibleContent Props

Inherits all Radix CollapsibleContent props:

#### `className`

```typescript
className?: string
```

Additional CSS classes. Automatically includes animation classes: `data-[state=open]:oui-animate-collapsible-down` and `data-[state=closed]:oui-animate-collapsible-up`.

## Usage Examples

### Basic Collapsible

```tsx
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@orderly.network/ui";

<Collapsible defaultOpen>
  <CollapsibleTrigger className="oui-flex oui-justify-between oui-items-center">
    Advanced settings
    <ChevronDownIcon className="data-[state=open]:-oui-rotate-180" />
  </CollapsibleTrigger>
  <CollapsibleContent className="oui-pt-2 oui-space-y-3">
    <SettingField />
    <SettingField />
  </CollapsibleContent>
</Collapsible>;
```

### Controlled Collapsible

```tsx
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@orderly.network/ui";

function ControlledCollapsible() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
      <CollapsibleContent>
        <p>This content is controlled</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### Accordion Pattern

```tsx
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@orderly.network/ui";

function Accordion() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="oui-space-y-2">
      {items.map((item) => (
        <Collapsible
          key={item.id}
          open={openItem === item.id}
          onOpenChange={(open) => setOpenItem(open ? item.id : null)}
        >
          <CollapsibleTrigger>{item.title}</CollapsibleTrigger>
          <CollapsibleContent>{item.content}</CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
```

## Implementation Notes

- Animations rely on CSS keyframes defined in `tailwind.css`; ensure they are included in consuming apps
- Contents are wrapped in `overflow-hidden` to avoid clipping during transitions
- `CollapsibleContent` automatically applies animation classes based on `data-state` attribute
- `Collapse` ensures proper aria attributes (`aria-expanded`, `aria-controls`) even when using custom triggers

## Integration Tips

1. Build accordions by controlling multiple `Collapsible` components from a parent state, keeping only one `open` at a time.
2. Wrap long collapsible content in `ScrollArea` when necessary to maintain consistent height.
3. When duplicating triggers (e.g., entire row clickable), combine `CollapsibleTrigger` with `asChild` to reuse existing markup.
4. Use `defaultOpen` for sections that should be expanded by default (e.g., first FAQ item).
5. Combine with icons (chevron, plus/minus) that rotate or change based on open state.
