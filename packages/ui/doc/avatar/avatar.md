# Avatar Reference

> Location: `packages/ui/src/avatar/avatar.tsx`, `packages/ui/src/avatar/index.ts`

## Overview

The Avatar system wraps Radix UI’s Avatar primitives to deliver consistent identity chips across the application. It includes the low‑level building blocks (`AvatarBase`, `AvatarImage`, `AvatarFallback`) plus two ready‑to‑use components: `Avatar` and `EVMAvatar`, the latter rendering deterministic Ethereum blockies via `ethereum-blockies-base64`. All sizing and styling is orchestrated with `tailwind-variants`, so spacing, rounding, and typography align with the rest of the design tokens.

## Source Structure

| File         | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| `avatar.tsx` | Declares `avatarVariants`, base/image/fallback components, `Avatar`, and `EVMAvatar`. |
| `index.ts`   | Re-exports every avatar-related symbol for package consumers.                         |

## Exports & Types

### `Avatar`

```typescript
const Avatar: React.ForwardRefExoticComponent<
  AvatarProps & React.RefAttributes<HTMLDivElement>
>
```

High-level component that composes `AvatarBase`, `AvatarImage`, and optional `AvatarFallback`.

### `AvatarBase`

```typescript
const AvatarBase: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants> &
    React.RefAttributes<HTMLDivElement>
>
```

Low-level wrapper around Radix `AvatarPrimitive.Root` with `size` variants.

### `AvatarImage`

```typescript
const AvatarImage: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> &
    React.RefAttributes<HTMLImageElement>
>
```

Image slot component for avatar.

### `AvatarFallback`

```typescript
const AvatarFallback: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> &
    React.RefAttributes<HTMLSpanElement>
>
```

Fallback slot component shown when image fails to load.

### `EVMAvatar`

```typescript
const EVMAvatar: React.ForwardRefExoticComponent<
  AvatarProps & { address: string } & React.RefAttributes<HTMLDivElement>
>
```

Avatar component that generates deterministic Ethereum blockies from an address.

### `avatarVariants`

```typescript
const avatarVariants: ReturnType<typeof tv>
```

Tailwind variants for avatar styling.

### `AvatarSizeType`

```typescript
type AvatarSizeType = VariantProps<typeof avatarVariants>["size"];
// "2xs" | "xs" | "sm" | "md" | "lg" | "xl"
```

### `AvatarProps`

```typescript
type AvatarProps = React.ComponentProps<typeof AvatarBase> &
  VariantProps<typeof avatarVariants> & {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
    delayMs?: number;
    onLoadingStatusChange?: AvatarPrimitive.AvatarImageProps["onLoadingStatusChange"];
  };
```

## Props & Behavior

### Avatar Props

#### `size`

```typescript
size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl"
```

Avatar size. Dimensions: `2xs` (16px), `xs` (20px), `sm` (24px), `md` (32px), `lg` (40px), `xl` (48px). Default: `"sm"`.

#### `src`

```typescript
src?: string
```

Image source URL.

#### `alt`

```typescript
alt?: string
```

Alternative text for the image.

#### `fallback`

```typescript
fallback?: React.ReactNode
```

Content to display when image fails to load or is loading. Typically `AvatarFallback` component.

#### `delayMs`

```typescript
delayMs?: number
```

Delay in milliseconds before showing fallback (Radix Avatar prop).

#### `onLoadingStatusChange`

```typescript
onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void
```

Callback when image loading status changes (Radix Avatar prop).

### EVMAvatar Props

#### `address` (required)

```typescript
address: string;
```

Ethereum address to generate blockie from.

Inherits all `AvatarProps` except `src` (automatically generated from address).

## Usage Example

```tsx
import { Avatar, AvatarFallback, EVMAvatar } from "@orderly.network/ui";

<Avatar
  size="lg"
  src={user.photoUrl}
  fallback={<AvatarFallback>AB</AvatarFallback>}
/>

<EVMAvatar address={walletAddress} size="sm" alt="Wallet avatar" />
```

- Combine with `Flex` + `Badge` to show online states.
- Wrap in `Popover` or `Dropdown` to present account actions on click.

## Implementation Tips

1. **Skeleton states**: Render `<Avatar fallback={<SkeletonAvatar />} />` before data resolves to avoid layout shift.
2. **Accessibility**: Always set meaningful `alt` text—use a name or a truncated address (`0x1234…abcd`).
3. **Performance**: Rely on `EVMAvatar` for massive address lists to avoid loading hundreds of remote images.
4. **Theming**: Pass `className` or inline `style` to align background/border with different surfaces (light vs. dark).
