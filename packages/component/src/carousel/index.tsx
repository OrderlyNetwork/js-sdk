import {
  Carousel as OriginCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

export type Carousel = typeof OriginCarousel & {
  Content: typeof CarouselContent;
  Item: typeof CarouselItem;
  Next: typeof CarouselNext;
  Previous: typeof CarouselPrevious;
};

const Carousel = OriginCarousel as Carousel;

Carousel.Content = CarouselContent;
Carousel.Item = CarouselItem;
Carousel.Next = CarouselNext;
Carousel.Previous = CarouselPrevious;

export { Carousel };
