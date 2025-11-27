# Empty State Reference

> Location: `packages/ui/src/empty/empty.tsx`, `packages/ui/src/empty/index.ts`

## Overview

`EmptyView` is a minimal placeholder component meant to standardize empty states. The default implementation simply renders "Empty view", serving as a lightweight fallback or starting point for more elaborate placeholders.

## Source Structure

| File        | Description                    |
| ----------- | ------------------------------ |
| `empty.tsx` | Exports `EmptyView` component. |
| `index.ts`  | Re-exports `EmptyView`.        |

## Exports & Types

### `EmptyView`

```typescript
const EmptyView: () => JSX.Element
```

Minimal empty state placeholder component.

## Props & Behavior

`EmptyView` accepts no props and renders a simple "Empty view" text.

## Usage Examples

### Basic Empty View

```tsx
import { EmptyView } from "@orderly.network/ui";

<ListView
  dataSource={orders}
  emptyView={<EmptyView />}
  renderItem={(item) => <OrderRow order={item} />}
/>;
```

### Custom Empty State

```tsx
import { EmptyView, Text, Button, Flex } from "@orderly.network/ui";

function CustomEmptyState() {
  return (
    <Flex direction="column" itemAlign="center" gap={4} className="oui-py-8">
      <Text size="lg" color="neutral" intensity={54}>
        No orders found
      </Text>
      <Button variant="outlined" size="sm">
        Create Order
      </Button>
    </Flex>
  );
}

<ListView
  dataSource={orders}
  emptyView={<CustomEmptyState />}
  renderItem={(item) => <OrderRow order={item} />}
/>;
```

### Empty State with Icon

```tsx
import { EmptyView, Text, Flex } from "@orderly.network/ui";
import { EmptyDataIcon } from "@orderly.network/ui";

function EmptyWithIcon() {
  return (
    <Flex direction="column" itemAlign="center" gap={2} className="oui-py-8">
      <EmptyDataIcon size={48} />
      <Text size="base" color="neutral" intensity={54}>
        No data available
      </Text>
    </Flex>
  );
}
```

## Implementation Notes

- `EmptyView` is intentionally minimal to serve as a starting point
- The component renders a simple `<div>` with "Empty view" text
- For production use, create custom empty states that match your design requirements

## Integration Tips

1. Keep custom empty states subtle—use `Text` with `intent="secondary"` and consider adding a `Button` for common next steps.
2. Combine with `Spinner` or skeleton components to transition seamlessly between loading and empty states.
3. If empty states contain links or buttons, ensure focus order skips hidden elements when data becomes available.
4. When internationalizing, replace the text with `useLocale("table").empty` or similar locale strings.
5. Clone the component to add icons, actions, or descriptions while retaining consistent typography.
6. Use `Flex` with `direction="column"` and `itemAlign="center"` for centered empty state layouts.
