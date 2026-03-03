# useEndReached.ts

## Overview

Hook that uses `IntersectionObserver` to call a callback when a sentinel element enters the viewport (e.g. for infinite scroll).

## Exports

### Function

| Name | Description |
|------|-------------|
| `useEndReached` | Subscribes to sentinel element visibility and invokes `onEndReached` when it intersects. |

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| sentinelRef | MutableRefObject<HTMLDivElement \| null> | Yes | Ref to the sentinel DOM element. |
| onEndReached | () => void | No | Callback when sentinel is visible. |

## Usage example

```tsx
const sentinelRef = useRef<HTMLDivElement | null>(null);
useEndReached(sentinelRef, () => loadMore());
return (
  <>
    <List items={items} />
    <div ref={sentinelRef} className="oui-invisible oui-h-px" />
  </>
);
```
