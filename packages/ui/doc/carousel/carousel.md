# Carousel Reference

> Location: `packages/ui/src/carousel/carousel.tsx`, `packages/ui/src/carousel/index.ts`

## Overview

`Carousel` wraps Embla Carousel to provide a declarative slider with orientation control, plugin support, keyboard navigation, and a React context for shared APIs (`scrollPrev`, `scrollNext`, `canScrollPrev`, `canScrollNext`). It is ideal for hero banners, featured markets, or product carousels.

## Source Structure

| File           | Description                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `carousel.tsx` | Declares `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselContext`, and the `useCarousel` hook. |
| `index.ts`     | Re-exports carousel components plus Embla helpers exposed by the package root.                         |

## Exports & Types

### `Carousel`

```typescript
const Carousel: (props: React.ComponentProps<"div"> & CarouselProps) => JSX.Element
```

Root component configuring Embla via `orientation`, `opts`, and `plugins`.

### `CarouselContent`

```typescript
const CarouselContent: (props: React.ComponentProps<"div">) => JSX.Element
```

Wraps the viewport and flex track.

### `CarouselItem`

```typescript
const CarouselItem: (props: React.ComponentProps<"div">) => JSX.Element
```

Slide container applying the correct padding/basis for horizontal or vertical orientation.

### `useCarousel`

```typescript
function useCarousel(): CarouselContextProps;
```

Hook for custom controls (progress indicators, arrows).

### `CarouselApi`

```typescript
type CarouselApi = UseEmblaCarouselType[1];
```

Type alias referring to Embla's API.

### `CarouselContextProps`

```typescript
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;
```

### `CarouselProps`

```typescript
type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};
```

## Props & Behavior

### Carousel Props

#### `orientation`

```typescript
orientation?: "horizontal" | "vertical"
```

Carousel orientation. Automatically sets Embla's axis. Default: `"horizontal"`.

#### `opts`

```typescript
opts?: CarouselOptions
```

Embla carousel options (looping, alignment, dragFree, etc.). Examples: `{ loop: true }`, `{ align: "start" }`, `{ dragFree: true }`.

#### `plugins`

```typescript
plugins?: CarouselPlugin
```

Array of Embla plugins such as `AutoScroll` or `Autoplay` (both re-exported by `@veltodefi/ui`).

#### `setApi`

```typescript
setApi?: (api: CarouselApi) => void
```

Callback receiving the Embla API instance for manual control.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

Inherits all standard `div` attributes.

## Usage Examples

### Basic Carousel

```tsx
import { Carousel, CarouselContent, CarouselItem } from "@veltodefi/ui";

<Carousel opts={{ loop: true }} className="oui-w-full">
  <CarouselContent>
    {banners.map((banner) => (
      <CarouselItem key={banner.id} className="oui-pl-4">
        <img src={banner.image} className="oui-rounded-2xl" alt="Promo" />
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>;
```

### Carousel with Custom Controls

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  Button,
} from "@veltodefi/ui";

function CarouselWithControls() {
  return (
    <Carousel>
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id}>{item.content}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}

function CarouselControls() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <>
      <Button onClick={scrollPrev} disabled={!canScrollPrev}>
        Previous
      </Button>
      <Button onClick={scrollNext} disabled={!canScrollNext}>
        Next
      </Button>
    </>
  );
}
```

### Vertical Carousel

```tsx
import { Carousel, CarouselContent, CarouselItem } from "@veltodefi/ui";

<Carousel orientation="vertical" opts={{ loop: true }}>
  <CarouselContent>
    {items.map((item) => (
      <CarouselItem key={item.id} className="oui-pt-4">
        {item.content}
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>;
```

### Carousel with API Access

```tsx
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@veltodefi/ui";

function ControlledCarousel() {
  const [api, setApi] = useState(null);

  return (
    <>
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>{item.content}</CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <button onClick={() => api?.scrollTo(0)}>Go to first</button>
    </>
  );
}
```

## Implementation Notes

- The provider stores `carouselRef` for the viewport and registers `onSelect`/`reInit` listeners to update scroll controls
- `cnBase` ensures orientation-specific padding (`-ml-4` vs. `-mt-4`)
- `role="region"` and `aria-roledescription="carousel"` are included for accessibility; supply `aria-label` when multiple carousels exist on a page
- Keyboard support: `ArrowLeft`/`ArrowRight` events trigger `scrollPrev`/`scrollNext` while the carousel is focused
- Context exposes booleans `canScrollPrev/Next` for disabling arrow buttons

## Integration Tips

1. Hook into `useCarousel()` to create custom next/prev buttons or pagination indicators.
2. For auto-advancing marquees, chain Embla with the exported plugins (`Autoplay`, `AutoScroll`).
3. Combine with `ScrollIndicator` to show gradient fades near the edges for horizontal lists.
4. When rendering variable-height slides, set `orientation="vertical"` and ensure each `CarouselItem` defines `min-height` to avoid jumps.
5. Use `setApi` to access Embla API for advanced features like programmatic scrolling or slide counting.
