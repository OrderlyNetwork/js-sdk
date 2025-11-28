# Hooks Reference

> Location: `packages/ui/src/hooks/*.ts`

## Overview

The hooks folder provides lightweight utilities for responsive behavior and DOM observation. These hooks are re-exported at the package root so both library components and product code can share the same logic.

## Source Structure

| File                    | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `useScreen.ts`          | Returns responsive breakpoint information (`isMobile`, `isDesktop`).                  |
| `useMediaQuery.ts`      | Evaluates an arbitrary media query string and returns a boolean, updating reactively. |
| `useObserverElement.ts` | Simplifies `ResizeObserver` usage for element size observation.                       |
| `index.ts`              | Re-exports all hooks.                                                                 |

## Exports & Types

### `useScreen`

```typescript
function useScreen(): {
  isMobile: boolean;
  isDesktop: boolean;
};
```

Returns responsive breakpoint information based on screen width. Uses `useMediaQuery` internally with a `(max-width: 768px)` query to determine mobile vs desktop.

**Returns:**

- `isMobile: boolean` - `true` when screen width ≤ 768px
- `isDesktop: boolean` - `true` when screen width > 768px (inverse of `isMobile`)

**Example:**

```tsx
import { useScreen } from "@orderly.network/ui";

function ResponsiveComponent() {
  const { isMobile, isDesktop } = useScreen();

  return (
    <div className={isMobile ? "oui-p-2" : "oui-p-4"}>
      {isDesktop && <Sidebar />}
      <MainContent />
    </div>
  );
}
```

### `useMediaQuery`

```typescript
function useMediaQuery(query: string): boolean;
```

Evaluates an arbitrary CSS media query string and returns a boolean indicating whether it matches. The hook updates reactively when the media query state changes.

**Parameters:**

- `query: string` - CSS media query string (e.g., `"(max-width: 768px)"`, `"(prefers-color-scheme: dark)"`)

**Returns:** `boolean` - `true` if the media query matches, `false` otherwise

**Example:**

```tsx
import { useMediaQuery } from "@orderly.network/ui";

function ThemeAwareComponent() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");

  return (
    <div className={prefersDark ? "dark-mode" : "light-mode"}>
      {isTablet && <TabletLayout />}
    </div>
  );
}
```

**Implementation Notes:**

- Returns `false` during SSR to prevent hydration mismatches
- Uses `window.matchMedia` with event listeners for reactive updates
- Automatically cleans up listeners on unmount

### `useObserverElement`

```typescript
function useObserverElement<T extends HTMLElement>(
  element: T | null,
  callback: (entry: ResizeObserverEntry) => void,
): void;
```

Observes an element's size changes using `ResizeObserver` and calls the callback whenever the element is resized. Useful for tracking element dimensions, implementing virtual scrolling, or triggering animations.

**Parameters:**

- `element: T | null` - The HTML element to observe, or `null` to disable observation
- `callback: (entry: ResizeObserverEntry) => void` - Function called with `ResizeObserverEntry` when element size changes

**Returns:** `void`

**Example:**

```tsx
import { useRef, useState } from "react";
import { useObserverElement } from "@orderly.network/ui";

function ResizableComponent() {
  const [width, setWidth] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useObserverElement(elementRef.current, (entry) => {
    const { width } = entry.contentRect;
    setWidth(width);
  });

  return <div ref={elementRef}>Width: {width}px</div>;
}
```

**Implementation Notes:**

- Automatically handles cleanup when element changes or component unmounts
- Does nothing if `element` is `null`
- Uses `ResizeObserver` which is widely supported in modern browsers

## Usage Examples

### Responsive Layout

```tsx
import { useScreen } from "@orderly.network/ui";

function Dashboard() {
  const { isMobile } = useScreen();

  return (
    <div className={isMobile ? "oui-flex-col" : "oui-flex-row"}>
      <Sidebar />
      <MainContent />
    </div>
  );
}
```

### Custom Media Query

```tsx
import { useMediaQuery } from "@orderly.network/ui";

function PrintStyles() {
  const isPrint = useMediaQuery("print");

  return isPrint ? <PrintLayout /> : <ScreenLayout />;
}
```

### Element Size Tracking

```tsx
import { useRef, useEffect, useState } from "react";
import { useObserverElement } from "@orderly.network/ui";

function DynamicGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useObserverElement(containerRef.current, (entry) => {
    const width = entry.contentRect.width;
    setColumns(Math.floor(width / 200)); // 200px per column
  });

  return (
    <div
      ref={containerRef}
      className="oui-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {/* Grid items */}
    </div>
  );
}
```

## Implementation Notes

- All hooks handle SSR gracefully by returning safe defaults or no-ops when `window` is undefined
- `useMediaQuery` uses both `addListener` (legacy) and `addEventListener` for maximum browser compatibility
- `useObserverElement` uses `ResizeObserver`, not `IntersectionObserver`—use it specifically for size tracking
- Hooks automatically clean up event listeners and observers on unmount

## Integration Tips

1. Use `useScreen` for responsive layouts that need to match Tailwind's `md:` breakpoint (768px).
2. Use `useMediaQuery` for custom breakpoints or feature detection (e.g., `prefers-reduced-motion`, `prefers-color-scheme`).
3. Use `useObserverElement` for dynamic layouts that depend on container size (virtual scrolling, masonry grids, responsive charts).
4. In SSR environments, these hooks return safe defaults—ensure your components handle the initial render correctly.
5. Combine `useScreen` with conditional rendering to optimize bundle size (e.g., only load mobile components on mobile).
