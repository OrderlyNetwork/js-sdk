"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { cn } from "@/utils/css";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/button/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const onSelect = React.useCallback(
      (api: CarouselApi) => {
        if (!api) {
          return;
        }

        // console.log("selected", api.scrollSnapList());

        if (scrollSnaps.length === 0) {
          setScrollSnaps(api.scrollSnapList());
        }

        setSelectedIndex(api.selectedScrollSnap());

        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
      },
      [scrollSnaps]
    );

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("orderly-relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="orderly-overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "orderly-flex",
          orientation === "horizontal"
            ? "orderly--ml-4"
            : "orderly--mt-4 orderly-flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "orderly-min-w-0 orderly-shrink-0 orderly-grow-0 orderly-basis-full",
        orientation === "horizontal" ? "orderly-pl-4" : "orderly-pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "contained", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "orderly-absolute  orderly-h-8 orderly-w-8 orderly-rounded-full",
        orientation === "horizontal"
          ? "orderly--left-12 orderly-top-1/2 orderly--translate-y-1/2"
          : "orderly--top-12 orderly-left-1/2 orderly--translate-x-1/2 orderly-rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      {/* @ts-ignore */}
      <ChevronLeft size={20} />
      <span className="orderly-sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "contained", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "orderly-absolute orderly-h-8 orderly-w-8 orderly-rounded-full",
        orientation === "horizontal"
          ? "orderly--right-12 orderly-top-1/2 orderly--translate-y-1/2"
          : "orderly--bottom-12 orderly-left-1/2 orderly--translate-x-1/2 orderly-rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      {/* @ts-ignore */}
      <ChevronRight size={20} />
      <span className="orderly-sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export type CarouselIdentifierProps = {
  className?: string;
  dotClassName?: string;
  onClick?: (index: number) => void;
  // asChild?: boolean;
};
const CarouselIdentifier: React.FC<CarouselIdentifierProps> = (props) => {
  const { scrollSnaps, selectedIndex } = useCarousel();

  return (
    <div className={cn("orderly-flex orderly-gap-1", props.className)}>
      {scrollSnaps.map((_, index) => {
        return (
          <Dot
            key={index}
            index={index}
            active={index === selectedIndex}
            onClick={props.onClick}
            className={props.dotClassName}
          />
        );
      })}
    </div>
  );
};

CarouselIdentifier.displayName = "CarouselIdentifier";

const Dot: React.FC<{
  index: number;
  active: boolean;
  onClick?: (index: number) => void;
  className?: string;
}> = ({ index, active, onClick, className }) => {
  return (
    <button
      onClick={() => onClick?.(index)}
      className={cn(
        "orderly-w-2 orderly-h-2 orderly-rounded-full",
        active ? "orderly-bg-primary" : "orderly-bg-white/30",
        className
      )}
    />
  );
};

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIdentifier,
};
