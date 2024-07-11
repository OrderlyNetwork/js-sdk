import { useEffect, useState } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";

export type EmblaCarouselType = Exclude<UseEmblaCarouselType[1], undefined>;

export type TEmblaApi = Pick<EmblaCarouselType, "scrollPrev" | "scrollNext">;

export type HeaderReturns = ReturnType<typeof useMarketsHeaderScript>;

export const useMarketsHeaderScript = () => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 50,
    slidesToScroll: "auto",
  });

  useEffect(() => {
    emblaApi?.on("select", () => {
      setScrollIndex(emblaApi?.selectedScrollSnap());
    });
  }, [emblaApi]);

  return {
    scrollIndex,
    setScrollIndex,
    emblaRef,
    emblaApi: emblaApi as TEmblaApi,
  };
};
