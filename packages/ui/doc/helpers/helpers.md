# Helpers Module Reference

> Location: `packages/ui/src/helpers/*.ts`

## Overview

The helpers directory contains shared types and prop parsers used by multiple components. Centralizing these utilities keeps spacing, sizing, and color semantics consistent across Box, Flex, Button, Input, and more.

## Source Structure

| File                   | Description                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `component-props.ts`   | Type utilities (`ComponentPropsWithout`, `ComponentPropsAs`, `RemovedProps`) to avoid prop name collisions. |
| `parse-props.ts`       | Functions (`parseSizeProps`, `parseAngleProps`) that translate spacing/sizing props into inline styles.     |
| `sizeType.ts`          | Defines common size enums (`SizeType`, `ExcludeXsSizeType`) for reuse across components.                    |
| `colorType.ts`         | Shared color type definitions (`colorType`) to ensure only supported tokens are accepted.                   |
| `layoutClassHelper.ts` | Placeholder helper for merging layout-related class names (currently unused).                               |

## Exports & Types

### `ComponentPropsWithout`

```typescript
type ComponentPropsWithout<
  T extends React.ElementType,
  O extends
    | Omit<string, keyof React.ComponentPropsWithoutRef<T>>
    | keyof React.ComponentPropsWithoutRef<T>,
> = Omit<React.ComponentPropsWithoutRef<T>, O & string>;
```

Omits specified props from component props. Used to remove conflicting HTML attributes when components define their own props with the same name.

**Example:**

```tsx
// Remove 'color' from button props since Button defines its own color variant
type ButtonProps = ComponentPropsWithout<"button", "color"> & {
  color: "primary" | "secondary";
};
```

### `ComponentPropsAs`

```typescript
type ComponentPropsAs<
  C extends React.ElementType<any>,
  T extends React.ComponentPropsWithoutRef<C>["as"],
> = Omit<
  Extract<React.ComponentPropsWithoutRef<C>, { as: T }>,
  "as" | "asChild"
>;
```

Extracts component props for a specific `as` prop value, excluding `as` and `asChild`.

### `RemovedProps`

```typescript
type RemovedProps = "asChild" | "defaultChecked" | "defaultValue" | "color";
```

Common props that should be omitted from component prop types to avoid conflicts.

### `parseSizeProps`

```typescript
function parseSizeProps<T extends {
  width?: number | string;
  height?: number | string;
  angle?: number;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  [key: string]: any;
}>(props: T): {
  ...rest,
  style: {
    ...rest.style,
    "--oui-width"?: string;
    "--oui-height"?: string;
    "--oui-gradient-angle"?: string;
    "--oui-left"?: string;
    "--oui-right"?: string;
    "--oui-top"?: string;
    "--oui-bottom"?: string;
  }
}
```

Parses size, position, and angle props into CSS custom properties (CSS variables) for inline styles. Numeric values are converted to pixel strings.

**Parameters:**

- `props` - Object containing size/position props and other properties

**Returns:** Object with parsed props and a `style` object containing CSS custom properties

**Example:**

```tsx
const { style, ...rest } = parseSizeProps({
  width: 100,
  height: 200,
  angle: 45,
  className: "my-box",
});
// style: { "--oui-width": "100px", "--oui-height": "200px", "--oui-gradient-angle": "45deg" }
```

### `parseAngleProps`

```typescript
function parseAngleProps(props: { angle?: number }): {
  "--oui-gradient-angle": string;
};
```

Parses the `angle` prop into a CSS custom property for gradient direction. Defaults to `180deg` if not provided.

**Parameters:**

- `props.angle?: number` - Gradient angle in degrees

**Returns:** Object with `--oui-gradient-angle` CSS custom property

**Example:**

```tsx
const angleStyle = parseAngleProps({ angle: 90 });
// { "--oui-gradient-angle": "90deg" }
```

### `SizeType`

```typescript
type SizeType = "xs" | "sm" | "md" | "lg" | "xl";
```

Standard size enumeration used across buttons, inputs, typography, and other components.

### `ExcludeXsSizeType`

```typescript
type ExcludeXsSizeType = Exclude<SizeType, "xs">;
// "sm" | "md" | "lg" | "xl"
```

Size type excluding the `xs` option, used in components that don't support extra-small sizes.

### `colorType`

```typescript
type colorType = "primary" | "success" | "danger" | "warning";
```

Semantic color type for status indicators and alerts.

## Usage Examples

### Using Type Helpers

```tsx
import type { ComponentPropsWithout, RemovedProps } from "@veltodefi/ui";

interface CustomButtonProps
  extends ComponentPropsWithout<"button", RemovedProps> {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
}
```

### Parsing Size Props

```tsx
import { parseSizeProps } from "@veltodefi/ui";

function MyComponent(props) {
  const { style, className, children, ...rest } = parseSizeProps(props);

  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
}
```

### Using Size Types

```tsx
import type { SizeType } from "@veltodefi/ui";

function createButton(size: SizeType) {
  // size is guaranteed to be one of: "xs" | "sm" | "md" | "lg" | "xl"
}
```

## Implementation Notes

- `parseSizeProps` converts numeric values to pixel strings automatically (e.g., `100` → `"100px"`).
- CSS custom properties are used instead of direct inline styles to enable theme-aware styling.
- Type helpers prevent prop name collisions between HTML attributes and component-specific props.
- `RemovedProps` includes common HTML attributes that components override with variant-based props.

## Integration Tips

1. Use `ComponentPropsWithout` when creating components that extend HTML elements but define their own variant props.
2. Import `parseSizeProps` in layout components to handle spacing/sizing props consistently.
3. Use `SizeType` for any component that needs size variants to maintain consistency across the design system.
4. When adding new props to `parseSizeProps`, ensure backward compatibility by making them optional.
