# Logo Reference

> Location: `packages/ui/src/logo/logo.tsx`

## Overview

`Logo` displays the Orderly brand mark with consistent padding and sizing, typically used in navigation bars or authentication screens.

## Source Structure

| File       | Description                                    |
| ---------- | ---------------------------------------------- |
| `logo.tsx` | Exports `Logo` component and `LogoProps` type. |

## Exports & Types

### `Logo`

```typescript
const Logo: React.ForwardRefExoticComponent<
  LogoProps & React.RefAttributes<HTMLDivElement>
>
```

Logo component that displays the brand mark.

### `LogoProps`

```typescript
type LogoProps = HTMLAttributes<HTMLDivElement> & {
  src: string;
  alt?: string;
  href?: string;
};
```

Extends `div` attributes with logo-specific props.

## Props & Behavior

### Logo Props

#### `src` (required)

```typescript
src: string;
```

Path to the logo image.

#### `alt`

```typescript
alt?: string
```

Accessible text describing the brand.

#### `href`

```typescript
href?: string
```

Link target. Default: `"/"`.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

Inherits all standard `HTMLAttributes<HTMLDivElement>` (e.g., `style`, `onClick`, etc.).

## Usage Examples

### Basic Logo

```tsx
import { Logo } from "@orderly.network/ui";

<header className="oui-flex oui-items-center">
  <Logo src="/logos/orderly.svg" href="https://orderly.network" />
  <Nav />
</header>;
```

### Logo with Alt Text

```tsx
import { Logo } from "@orderly.network/ui";

<Logo src="/logos/orderly.svg" alt="Orderly Network" href="/" />;
```

### Logo with Custom Styling

```tsx
import { Logo } from "@orderly.network/ui";

<Logo
  src="/logos/orderly.svg"
  className="[&_img]:oui-h-10"
  style={{ padding: "0.5rem" }}
/>;
```

### Logo as Link

```tsx
import { Link } from "next/link";
import { Logo } from "@orderly.network/ui";

<Logo src="/logos/orderly.svg" href="/dashboard" />;
```

## Implementation Notes

- Logo renders an `<img>` inside an `<a>` tag
- Default image height is `oui-h-8` (32px) with `oui-py-2` padding
- Container has `oui-px-3` horizontal padding
- Image uses `oui-object-contain` to maintain aspect ratio

## Integration Tips

1. Wrap `Logo` with routing components (`next/link`, `react-router-dom/Link`) if you need client-side navigation.
2. Swap the `src` based on theme using `useOrderlyTheme` or CSS `[data-theme]` selectors.
3. Override padding/height by applying utility classes to the wrapper (e.g., `className="[&_img]:oui-h-10"`).
4. Use `alt` text for accessibility, especially if the logo is the primary navigation element.
5. For responsive designs, use CSS to adjust logo size at different breakpoints.
