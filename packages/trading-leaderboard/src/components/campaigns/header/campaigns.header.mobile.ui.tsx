import { FC, useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@orderly.network/ui";
import { DefaultCampaign } from "../DefaultCampaign";
import { CampaignItemUI } from "../campaign.item.ui";
import { CampaignConfig } from "../type";
import { getCampaignTag } from "../utils";

export const CampaignsHeaderMobileUI: FC<{
  campaigns: CampaignConfig[];
  currentCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
  backgroundSrc?: string;
}> = ({ campaigns, currentCampaignId, onCampaignChange, backgroundSrc }) => {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
  });

  // All campaign items including default campaign
  const allCampaignItems = [
    { campaign_id: "general", isDefault: true },
    ...campaigns.map((campaign) => ({ ...campaign, isDefault: false })),
  ];

  // Update scroll availability and handle auto campaign change on slide
  const updateScrollAvailability = useCallback(() => {
    if (!emblaApi || !campaigns?.length) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());

    // Auto trigger onCampaignChange when slide changes
    const selectedIndex = emblaApi.selectedScrollSnap();
    const selectedCampaign = allCampaignItems[selectedIndex];

    if (selectedCampaign) {
      const campaignId = selectedCampaign.isDefault
        ? "general"
        : String(selectedCampaign.campaign_id);
      if (campaignId !== currentCampaignId) {
        onCampaignChange(campaignId);
      }
    }
  }, [
    emblaApi,
    campaigns,
    currentCampaignId,
    onCampaignChange,
    allCampaignItems,
  ]);

  useEffect(() => {
    if (!emblaApi) return;

    // Initial check
    updateScrollAvailability();

    // Listen for scroll events
    emblaApi.on("select", updateScrollAvailability);
    emblaApi.on("reInit", updateScrollAvailability);

    return () => {
      emblaApi.off("select", updateScrollAvailability);
      emblaApi.off("reInit", updateScrollAvailability);
    };
  }, [emblaApi, updateScrollAvailability]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Mobile shows one item at full width
  const slideStyle = { flexBasis: "100%", width: "100%", height: "42px" };

  // Hide scroll buttons when there's only one or no campaigns
  const shouldHideScrollButtons = campaigns.length <= 1;

  return (
    <div className="oui-flex oui-gap-2 oui-w-full oui-items-center oui-px-3">
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={`oui-group oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-6 oui-h-[42px] oui-rounded-lg oui-transition-colors hover:oui-bg-base-7 disabled:oui-opacity-30 disabled:oui-cursor-not-allowed disabled:hover:oui-bg-transparent ${shouldHideScrollButtons ? "oui-hidden" : ""}`}
        aria-label="Previous campaigns"
      >
        <ChevronLeftIcon
          opacity={1}
          className="oui-text-base-contrast-54 group-hover:oui-text-base-contrast"
        />
      </button>

      <div className="oui-flex-1 oui-min-w-0 oui-overflow-hidden">
        <div ref={emblaRef}>
          <div className="oui-flex oui-gap-2">
            <DefaultCampaign
              key="general_campaign"
              currentCampaignId={currentCampaignId}
              onCampaignChange={onCampaignChange}
              style={slideStyle}
              className="oui-w-full oui-flex-shrink-0"
            />
            {campaigns?.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="oui-flex-shrink-0"
                style={slideStyle}
              >
                <CampaignItemUI
                  backgroundSrc={backgroundSrc}
                  campaign={campaign}
                  tag={getCampaignTag(campaign)}
                  active={currentCampaignId == campaign.campaign_id}
                  onCampaignChange={onCampaignChange}
                  classNames={{
                    container: "oui-h-[42px]",
                    title: "oui-text-[10px]",
                    content: "oui-gap-[2px]",
                    tag: {
                      container: "oui-h-[14px] oui-px-1 oui-py-[2px]",
                      text: "oui-text-[10px]",
                    },
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={`oui-group oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-6 oui-h-[42px] oui-rounded-lg oui-transition-colors hover:oui-bg-base-7 disabled:oui-opacity-30 disabled:oui-cursor-not-allowed disabled:hover:oui-bg-transparent ${shouldHideScrollButtons ? "oui-hidden" : ""}`}
        aria-label="Next campaigns"
      >
        <ChevronRightIcon
          opacity={1}
          className="oui-text-base-contrast-54 group-hover:oui-text-base-contrast"
        />
      </button>
    </div>
  );
};
