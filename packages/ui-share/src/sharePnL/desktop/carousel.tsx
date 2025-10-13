import { FC, useCallback, useEffect } from "react";
import { Box, cn, Flex, useEmblaCarousel } from "@kodiak-finance/orderly-ui";
import { NextButton, PrevButton } from "./buttons";

export const CarouselBackgroundImage: FC<{
  backgroundImages: ReadonlyArray<string> | string[];
  selectedSnap: number;
  setSelectedSnap: any;
}> = (props) => {
  const { backgroundImages, selectedSnap, setSelectedSnap } = props;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    // loop: true,
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    if (emblaApi?.canScrollPrev()) {
      emblaApi.scrollPrev();
    } else if (selectedSnap - 1 >= 0) {
      setSelectedSnap(selectedSnap - 1);
    }
  }, [emblaApi, selectedSnap]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    if (emblaApi?.canScrollNext()) {
      emblaApi.scrollNext();
    } else if (selectedSnap + 1 < backgroundImages.length) {
      setSelectedSnap(selectedSnap + 1);
    }
  }, [emblaApi, selectedSnap]);

  const onSelect = useCallback((emblaApi: any) => {
    // setPrevBtnDisabled(!emblaApi.canScrollPrev());
    // setNextBtnDisabled(!emblaApi.canScrollNext());
    setSelectedSnap(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    emblaApi?.scrollTo(selectedSnap);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Flex mt={4} px={2}>
      <PrevButton onClick={onPrevButtonClick} />
      <div
        ref={emblaRef}
        className="oui-w-full oui-overflow oui-overflow-x-auto oui-scrollbar-hidden oui-hide-scrollbar oui-mx-0"
      >
        <Flex>
          {backgroundImages.map((e, index) => (
            <Box
              key={e}
              onClick={() => {
                if (emblaApi?.canScrollPrev() || emblaApi?.canScrollNext()) {
                  emblaApi?.scrollTo(index);
                } else {
                  setSelectedSnap(index);
                }
              }}
              mx={2}
              my={1}
              mr={6}
              r="base"
              className={cn(
                "oui-shrink-0 oui-w-[162px]",
                selectedSnap === index &&
                  "oui-outline oui-outline-1 oui-outline-primary-darken",
              )}
            >
              <img src={e} className="oui-rounded-sm" />
            </Box>
          ))}
        </Flex>
      </div>
      <NextButton onClick={onNextButtonClick} />
    </Flex>
  );
};
