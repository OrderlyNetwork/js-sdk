import useEmblaCarousel from "embla-carousel-react";
import { FC, useCallback, useEffect } from "react";
import { NextButton, PrevButton } from "./buttons";
import { cn } from "@/utils";

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
      <div className="orderly-flex orderly-px-[10px] orderly-mt-5">
        <PrevButton onClick={onPrevButtonClick} />
        <div
          ref={emblaRef}
          className="orderly-w-[552px] orderly-overflow orderly-overflow-x-auto orderly-scrollbar-hidden orderly-hide-scrollbar orderly-mx-2"
        >
          <div className="orderly-flex">
            {backgroundImages.map((e, index) => (
              <div
                key={e}
                onClick={() => {
                  console.log("scroll to", index);
  
                  emblaApi?.scrollTo(index);
                }}
                className={cn(
                  "orderly-shrink-0 orderly-mx-2 orderly-w-[162px] orderly-my-1 orderly-mr-[21px] orderly-rounded-sm",
                  selectedSnap === index &&
                  "orderly-outline orderly-outline-1 orderly-outline-primary"
                )}
              >
                <img src={e} className="orderly-rounded-sm" />
              </div>
            ))}
          </div>
        </div>
        <NextButton onClick={onNextButtonClick} />
      </div>
    );
  };