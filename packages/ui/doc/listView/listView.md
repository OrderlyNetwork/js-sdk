# ListView Reference

> Location: `packages/ui/src/listView/listView.tsx`, `packages/ui/src/listView/useEndReached.ts`, `packages/ui/src/listView/index.ts`

## Overview

`ListView` is a scrollable container that renders arbitrary data via `renderItem`, manages empty/loading states, and triggers `loadMore` when the sentinel reaches the viewport (infinite scroll). It exposes an imperative API allowing parents to programmatically scroll.

## Source Structure

| File               | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `listView.tsx`     | Implements the `ListView` component with infinite scroll support. |
| `useEndReached.ts` | IntersectionObserver hook that powers infinite scrolling.         |
| `index.ts`         | Re-exports `ListView` and `ListViewProps`.                        |

## Exports & Types

### `ListView`

```typescript
const ListView: <T, D>(
  props: ListViewProps<T, D> & { ref?: ListViewRef }
) => JSX.Element
```

Scrollable list component with infinite scroll support.

### `ListViewProps`

```typescript
interface ListViewProps<T, D> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number, extraData?: D) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadMore?: () => void;
  style?: React.CSSProperties;
  extraData?: D;
  emptyView?: React.ReactNode;
}
```

### `ListViewRef`

```typescript
type ListViewRef = ForwardedRef<{
  scroll: (direction: { x: number; y: number }) => void;
}>;
```

Imperative handle for programmatic scrolling.

## Props & Behavior

### ListView Props

#### `dataSource` (required)

```typescript
dataSource: T[] | null | undefined
```

Array of data items. If `null`/`undefined`, nothing is rendered (useful during initial loading). An empty array triggers `emptyView`.

#### `renderItem` (required)

```typescript
renderItem: (item: T, index: number, extraData?: D) => React.ReactNode;
```

Function to render each item. Called with the item, its index, and optional `extraData` context.

#### `isLoading`

```typescript
isLoading?: boolean
```

Controls whether the bottom spinner appears. When `true`, shows loading indicator at the bottom.

#### `loadMore`

```typescript
loadMore?: () => void
```

Callback invoked when the sentinel enters the viewport and `isLoading` is `false`. Used for infinite scroll.

#### `extraData`

```typescript
extraData?: D
```

Additional data passed to `renderItem`. Useful for shared context without global state.

#### `emptyView`

```typescript
emptyView?: React.ReactNode
```

Custom fallback when `dataSource` is empty. Defaults to `EmptyDataState`.

#### `className`

```typescript
className?: string
```

Additional CSS classes for the container.

#### `contentClassName`

```typescript
contentClassName?: string
```

Applied to the inner wrapper. Default: `oui-space-y-3`.

#### `style`

```typescript
style?: React.CSSProperties
```

Inline styles for the container.

## Usage Examples

### Basic ListView

```tsx
import { ListView } from "@veltodefi/ui";

<ListView
  dataSource={orders}
  renderItem={(order, index) => (
    <OrderTile key={order.id} order={order} index={index} />
  )}
/>;
```

### ListView with Infinite Scroll

```tsx
import { ListView, useRef } from "@veltodefi/ui";

const ref = useRef<ListViewRef>(null);

<ListView
  ref={ref}
  dataSource={orders}
  isLoading={loadingMore}
  loadMore={fetchNextPage}
  renderItem={(order, index) => (
    <OrderTile key={order.id} order={order} index={index} />
  )}
  emptyView={<EmptyOrders />}
/>;
```

### ListView with Extra Data

```tsx
import { ListView } from "@veltodefi/ui";

<ListView
  dataSource={positions}
  extraData={{ quoteCurrency: "USDC" }}
  renderItem={(position, index, extraData) => (
    <PositionRow position={position} quoteCurrency={extraData?.quoteCurrency} />
  )}
/>;
```

### Programmatic Scrolling

```tsx
import { ListView, useRef } from "@veltodefi/ui";

const listRef = useRef<ListViewRef>(null);

function scrollToTop() {
  listRef.current?.scroll({ x: 0, y: 0 });
}

<ListView
  ref={listRef}
  dataSource={items}
  renderItem={(item) => <ItemRow item={item} />}
/>;
```

## Implementation Notes

- `useEndReached` attaches to a hidden sentinel positioned near the bottom of the scroll container
- `useImperativeHandle` exposes `scroll({ x, y })` for parent components
- Loading indicator is suppressed when the list is empty to avoid redundant UI with `emptyView`
- Container uses `oui-custom-scrollbar` for styled scrollbars
- Default minimum height is `180px`

## Integration Tips

1. Memoize `renderItem` or wrap row components in `React.memo` for large data sets.
2. Combine with `ScrollArea` for horizontal virtualization or to style scrollbars.
3. Provide `extraData` when items require shared context (e.g., quote currency) without resorting to global state.
4. Use `ref` for programmatic scrolling when implementing "scroll to top" buttons or navigation.
5. Handle `null`/`undefined` `dataSource` to show loading skeletons before data arrives.
