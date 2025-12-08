# Miscellaneous Components Reference

> Location: `packages/ui/src/misc/either.tsx`, `packages/ui/src/misc/switch.tsx`

## Overview

The `misc` directory contains small helper components for conditional rendering. Currently, only `Either` is exported; the experimental `Switch` implementation remains internal due to bundler limitations.

## Source Structure

| File         | Description                                           |
| ------------ | ----------------------------------------------------- |
| `either.tsx` | Exports `Either` component for conditional rendering. |
| `switch.tsx` | Experimental `Switch` component (not exported).       |

## Exports & Types

### `Either`

```typescript
const Either: React.MemoExoticComponent<React.FC<PropsWithChildren<Props>>>
```

Conditional rendering component that displays children or left content based on a boolean value.

### `EitherProps`

```typescript
type Props = {
  value: boolean | (() => boolean);
  left?: ReactNode;
};
```

Props for the `Either` component.

## Props & Behavior

### Either Props

#### `value` (required)

```typescript
value: boolean | (() => boolean);
```

Boolean value or function returning boolean. When `true`, renders `children`; when `false`, renders `left`.

#### `left`

```typescript
left?: ReactNode
```

Content to render when `value` is `false`. If not provided, renders nothing.

#### `children`

```typescript
children?: ReactNode
```

Content to render when `value` is `true`.

## Usage Examples

### Basic Either

```tsx
import { Either } from "@veltodefi/ui";

<Either is={isLoggedIn} when={<UserPanel />} otherwise={<LoginCTA />} />;
```

### Either with Function Value

```tsx
import { Either } from "@veltodefi/ui";

<Either value={() => user?.isPremium} left={<UpgradePrompt />}>
  <PremiumFeatures />
</Either>;
```

### Either for Loading States

```tsx
import { Either } from "@veltodefi/ui";

<Either value={!isLoading} left={<Spinner />}>
  <Content />
</Either>;
```

### Either with Multiple Conditions

```tsx
import { Either } from "@veltodefi/ui";

<Either value={hasData}>
  <DataView />
  <Either value={isLoading} left={<EmptyState />}>
    <Skeleton />
  </Either>
</Either>;
```

## Implementation Notes

- `Either` is memoized to prevent unnecessary re-renders
- `value` can be a function, which is evaluated on each render
- Component simplifies JSX by removing nested ternaries
- When `value` is `false` and `left` is not provided, component returns `null`

## Integration Tips

1. Use `Either` to keep JSX declarative when toggling based on async data (e.g., show skeleton vs. content).
2. Wrap complex `when`/`otherwise` branches in memoized components to avoid re-renders.
3. If you need more than two branches, implement a lightweight switch pattern (or revisit the experimental component once stabilized).
4. Use function values for computed conditions that depend on props or state.
5. Combine with `React.memo` for performance optimization in frequently re-rendering components.

## Switch (Experimental)

- Located in `misc/switch.tsx` but not exported to avoid Vite recursion issues.
- Provides a `Match/Case` style API similar to pattern matching.
- Consider copying the file into product code if necessary and ensure bundler compatibility first.
