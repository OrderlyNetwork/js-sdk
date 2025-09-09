import { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export const useSelectedSnapDisplay = (emblaApi?: EmblaCarouselType) => {
  const [selectedSnap, setSelectedSnap] = useState<number>(0);
  const [snapCount, setSnapCount] = useState<number>(0);

  const updateScrollSnapState = useCallback((emblaApi?: EmblaCarouselType) => {
    if (emblaApi) {
      setSnapCount(emblaApi.scrollSnapList().length);
      setSelectedSnap(emblaApi.selectedScrollSnap());
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    updateScrollSnapState(emblaApi);
    emblaApi.on("select", updateScrollSnapState);
    emblaApi.on("reInit", updateScrollSnapState);
    return () => {
      emblaApi.off("select", updateScrollSnapState);
      emblaApi.off("reInit", updateScrollSnapState);
    };
  }, [emblaApi, updateScrollSnapState]);

  return {
    selectedSnap,
    snapCount,
  } as const;
};
