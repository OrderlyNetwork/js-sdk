import { FC, useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@orderly.network/ui";
import { DefaultCampaign } from "./DefaultCampaign";
import { CampaignItemUI } from "./campaign.item.ui";
import { CampaignConfig } from "./type";
import { getCampaignTag } from "./utils";

export const CampaignsHeaderUI: FC<{
  campaigns: CampaignConfig[];
  currentCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
}> = ({ campaigns, currentCampaignId, onCampaignChange }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    // Check initial size
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Calculate width considering gap (0.5rem = 8px)
  // For 2 items: (100% - 1 * gap) / 2
  // For 3 items: (100% - 2 * gap) / 3
  const slideStyle = isLargeScreen
    ? { flexBasis: "calc((100% - 1rem) / 3)", width: "calc((100% - 1rem) / 3)" }
    : {
        flexBasis: "calc((100% - 0.5rem) / 2)",
        width: "calc((100% - 0.5rem) / 2)",
      };

  return (
    <div className="oui-flex oui-gap-2 oui-w-full oui-items-center">
      <div className="oui-flex-shrink-0">
        <DefaultCampaign
          currentCampaignId={currentCampaignId}
          onCampaignChange={onCampaignChange}
        />
      </div>

      <button
        onClick={scrollPrev}
        className="oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-8 oui-h-8 oui-p-1 oui-rounded oui-transition-colors hover:oui-bg-base-6"
        aria-label="Previous campaigns"
      >
        <ChevronLeftIcon />
      </button>

      <div className="oui-flex-1 oui-min-w-0 oui-overflow-hidden">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container oui-flex oui-gap-2">
            {campaigns?.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="embla__slide oui-flex-shrink-0"
                style={slideStyle}
              >
                <CampaignItemUI
                  campaign={campaign}
                  tag={getCampaignTag(campaign)}
                  active={currentCampaignId === campaign.campaign_id}
                  onCampaignChange={onCampaignChange}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={scrollNext}
        className="oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-8 oui-h-8 oui-p-1 oui-rounded oui-transition-colors hover:oui-bg-base-6"
        aria-label="Next campaigns"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};
