import useEmblaCarousel from "embla-carousel-react";
import { FC, useCallback, useEffect } from "react";
import { NextButton, PrevButton } from "./buttons";
import { cn, Flex } from "@orderly.network/ui";

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
    <Flex mt={5} px={2} >
      <PrevButton onClick={onPrevButtonClick} />
      <div
        ref={emblaRef}
        className="oui-w-[552px] oui-overflow oui-overflow-x-auto oui-scrollbar-hidden oui-hide-scrollbar oui-mx-2"
      >
        <div className="oui-flex">
          {backgroundImages.map((e, index) => (
            <div
              key={e}
              onClick={() => {
                console.log("scroll to", index);

                emblaApi?.scrollTo(index);
              }}
              className={cn(
                "oui-shrink-0 oui-mx-2 oui-w-[162px] oui-my-1 oui-mr-[21px] oui-rounded-sm",
                selectedSnap === index &&
                  "oui-outline oui-outline-1 oui-outline-primary"
              )}
            >
              <img src={e} className="oui-rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      <NextButton onClick={onNextButtonClick} />
    </Flex>
  );
};
