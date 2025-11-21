# Marquee Reference

> Location: `packages/ui/src/marquee/marquee.tsx`, `packages/ui/src/marquee/index.ts`

## Overview

`Marquee` composes Embla Carousel with the AutoScroll plugin to deliver continuous scrolling tickers (horizontal or vertical). It accepts data arrays and a `renderItem` callback, making it ideal for market tickers, partner logos, or notification strips.

## Source Structure

| File          | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `marquee.tsx` | Exports `Marquee` component, `MarqueeProps`, and `AutoScrollOptions` types. |
| `index.ts`    | Re-exports `Marquee` and related types.                                     |

## Exports & Types

### `Marquee`

```typescript
const Marquee: <T>(props: MarqueeProps<T>) => JSX.Element | null
```

Marquee component with auto-scroll functionality.

### `MarqueeProps`

```typescript
interface MarqueeProps<T = unknown> {
  data: T[] | ReadonlyArray<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  carouselOptions?: EmblaCarouselOptions;
  autoScrollOptions?: AutoScrollOptions;
  className?: string;
  setApi?: (api: EmblaCarouselType) => void;
}
```

### `AutoScrollOptions`

```typescript
interface AutoScrollOptions {
  speed?: number;
  direction?: "forward" | "backward";
  playOnInit?: boolean;
  stopOnInteraction?: boolean;
  stopOnMouseEnter?: boolean;
  stopOnFocusIn?: boolean;
  startDelay?: number;
  rootNode?: (emblaRoot: HTMLElement) => HTMLElement;
}
```

## Props & Behavior

### Marquee Props

#### `data` (required)

```typescript
data: T[] | ReadonlyArray<T>
```

Array of data items to display in the marquee. If empty, component returns `null`.

#### `renderItem` (required)

```typescript
renderItem: (item: T, index: number) => React.ReactNode;
```

Function to render each item. Receives the item and its index.

#### `carouselOptions`

```typescript
carouselOptions?: EmblaCarouselOptions
```

Embla carousel options (looping, alignment, axis). Defaults: `{ loop: true, align: "start", axis: "x" }`.

#### `autoScrollOptions`

```typescript
autoScrollOptions?: AutoScrollOptions
```

Auto-scroll plugin options. Defaults: `{ speed: 1, direction: "forward", playOnInit: true, stopOnMouseEnter: true }`.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

#### `setApi`

```typescript
setApi?: (api: EmblaCarouselType) => void
```

Callback to receive the Embla API instance for manual control.

### AutoScrollOptions

#### `speed`

```typescript
speed?: number
```

Scroll speed in pixels per second. Default: `1`.

#### `direction`

```typescript
direction?: "forward" | "backward"
```

Scroll direction. Default: `"forward"`.

#### `playOnInit`

```typescript
playOnInit?: boolean
```

Whether to start auto-scrolling on initialization. Default: `true`.

#### `stopOnInteraction`

```typescript
stopOnInteraction?: boolean
```

Whether to stop auto-scrolling on user interaction. Default: `false`.

#### `stopOnMouseEnter`

```typescript
stopOnMouseEnter?: boolean
```

Whether to stop auto-scrolling on mouse enter. Default: `true`.

#### `stopOnFocusIn`

```typescript
stopOnFocusIn?: boolean
```

Whether to stop auto-scrolling on focus. Default: `false`.

#### `startDelay`

```typescript
startDelay?: number
```

Delay before starting auto-scroll in milliseconds.

## Usage Examples

### Basic Marquee

```tsx
import { Marquee } from "@orderly.network/ui";

<Marquee
  data={tickers}
  renderItem={(item) => (
    <div className="oui-flex oui-items-center oui-gap-2">
      <Text color={item.change > 0 ? "success" : "danger"}>{item.symbol}</Text>
      <Text.numeral value={item.price} dp={4} />
    </div>
  )}
/>;
```

### Marquee with Custom Options

```tsx
import { Marquee } from "@orderly.network/ui";

<Marquee
  data={logos}
  renderItem={(logo) => <img src={logo.src} alt={logo.name} />}
  carouselOptions={{
    loop: true,
    align: "start",
    axis: "x",
  }}
  autoScrollOptions={{
    speed: 1.2,
    direction: "forward",
    stopOnMouseEnter: true,
    stopOnInteraction: true,
  }}
/>;
```

### Vertical Marquee

```tsx
import { Marquee } from "@orderly.network/ui";

<Marquee
  data={notifications}
  renderItem={(notification) => (
    <div className="oui-p-2 oui-border-b">{notification.message}</div>
  )}
  carouselOptions={{ axis: "y" }}
  autoScrollOptions={{ speed: 0.5 }}
/>;
```

### Controlled Marquee

```tsx
import { useState } from "react";
import { Marquee } from "@orderly.network/ui";

function ControlledMarquee() {
  const [api, setApi] = useState(null);

  return (
    <>
      <Marquee
        data={items}
        renderItem={(item) => <div>{item}</div>}
        setApi={setApi}
      />
      <button onClick={() => api?.scrollPrev()}>Previous</button>
      <button onClick={() => api?.scrollNext()}>Next</button>
    </>
  );
}
```

## Implementation Notes

- Determines orientation from `carouselOptions.axis`; adjusts flex direction accordingly
- Duplicates data logically by reusing indices, ensuring seamless loops without manual cloning
- Exposes Embla plugins from the package root for reuse elsewhere
- Returns `null` if `data` is empty to avoid stray wrappers

## Integration Tips

1. Pause on hover by enabling `stopOnMouseEnter` or controlling the API via `setApi`.
2. For clickable items, set `stopOnInteraction: true` to prevent accidental scroll while interacting.
3. Ensure `data` is non-empty; if empty, Marquee returns `null` to avoid stray wrappers.
4. Adjust `speed` based on content length and desired user experience.
5. Use `startDelay` to delay auto-scroll until after initial render or animations complete.
