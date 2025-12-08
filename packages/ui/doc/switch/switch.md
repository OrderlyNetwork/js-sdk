# Switch Reference

> Location: `packages/ui/src/switch/switch.tsx`

## Overview

`Switch` wraps Radix Switch to provide accessible on/off toggles with theme-aligned tracks and thumbs. It’s ideal for preferences, feature flags, and mobile-friendly toggles.

## Source Structure

| File         | Description                                          |
| ------------ | ---------------------------------------------------- |
| `switch.tsx` | Exports the `Switch` component with variant support. |
| `index.ts`   | Re-exports `Switch`.                                 |

## Exports & Types

### `Switch`

```typescript
const Switch: React.ForwardRefExoticComponent<
  SwitchProps & React.RefAttributes<HTMLButtonElement>
>
```

Switch toggle component built on Radix UI primitives.

### `SwitchProps`

```typescript
type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> & {
  size?: "sm" | "md" | "lg";
};
```

Extends Radix Switch props with size variant.

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

Disable the switch.

#### `size`

```typescript
size?: "sm" | "md" | "lg"
```

Switch size for different touch targets. Default: `"md"`.

**Note:** Applies semantic colors for on/off states and animates the thumb translation. Focus ring ensures keyboard visibility.

## Usage

```tsx
import { Switch } from "@veltodefi/ui";

<label className="oui-flex oui-items-center oui-gap-2">
  <Switch checked={enabled} onCheckedChange={setEnabled} />
  Auto borrow
</label>;
```

## Integration Tips

1. Add descriptive text or `aria-describedby` to explain the effect of toggling (especially for destructive settings).
2. Disable the switch while asynchronous updates are pending to prevent conflicting operations.
3. Increase `size` on touch-heavy surfaces to improve accessibility.
