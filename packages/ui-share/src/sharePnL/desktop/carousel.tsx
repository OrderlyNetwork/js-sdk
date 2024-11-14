import useEmblaCarousel from "embla-carousel-react";
import { FC, useCallback, useEffect } from "react";
import { NextButton, PrevButton } from "./buttons";
import { Box, cn, Flex } from "@orderly.network/ui";

export const CarouselBackgroundImage: FC<{
  backgroundImages: string[];
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
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    // setPrevBtnDisabled(!emblaApi.canScrollPrev());
    // setNextBtnDisabled(!emblaApi.canScrollNext());
    setSelectedSnap(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    emblaApi?.scrollTo(selectedSnap);
  }, [emblaApi, onSelect]);

  return (
    <Flex mt={4} px={2} >
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

                emblaApi?.scrollTo(index);
              }}
              mx={2}
              my={1}
              mr={6}
              r="base"
              className={cn(
                "oui-shrink-0 oui-w-[162px]",
                selectedSnap === index &&
                  "oui-outline oui-outline-1 oui-outline-primary-darken"
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
