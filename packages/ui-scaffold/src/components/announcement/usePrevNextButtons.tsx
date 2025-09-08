import { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export const usePrevNextButtons = (
  emblaApi?: EmblaCarouselType,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.scrollPrev();
    onButtonClick?.(emblaApi);
  }, [emblaApi, onButtonClick]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.scrollNext();
    onButtonClick?.(emblaApi);
  }, [emblaApi, onButtonClick]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } as const;
};

export const useSelectedSnapDisplay = (emblaApi?: EmblaCarouselType) => {
  const [selectedSnap, setSelectedSnap] = useState<number>(0);
  const [snapCount, setSnapCount] = useState<number>(0);

  const updateScrollSnapState = useCallback((emblaApi: EmblaCarouselType) => {
    setSnapCount(emblaApi.scrollSnapList().length);
    setSelectedSnap(emblaApi.selectedScrollSnap());
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
