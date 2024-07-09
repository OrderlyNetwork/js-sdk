import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export type HeaderReturns = ReturnType<typeof useMarketsHeaderScript>;

const count = 3;

export const useMarketsHeaderScript = () => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 50,
    slidesToScroll: "auto",
  });

  useEffect(() => {
    emblaApi?.on("select", () => {
      setScrollIndex(emblaApi?.selectedScrollSnap() % count);
    });
  }, [emblaApi]);

  return {
    scrollIndex,
    setScrollIndex,
    emblaRef,
  };
};
