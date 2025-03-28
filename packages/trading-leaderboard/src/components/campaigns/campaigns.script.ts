import { useEffect, useMemo, useState } from "react";
import { useTradingLeaderboardContext, Campaign } from "../provider";
import { useScreen } from "@orderly.network/ui";
import { formatCampaignDate } from "../../utils";

export type CampaignsScriptReturn = ReturnType<typeof useCampaignsScript>;

// Define the type for our categorized campaigns
type CategorizedCampaigns = {
  ongoing: Campaign[];
  past: Campaign[];
  future: Campaign[];
};

export type CurrentCampaigns = Campaign & {
  displayTime: string;
  learnMoreUrl: string;
  tradingUrl: string;
};

type CategoryKey = keyof CategorizedCampaigns;

export function useCampaignsScript() {
  const { campaigns = [], href } = useTradingLeaderboardContext();
  const [category, setCategory] = useState<CategoryKey>("ongoing");

  const { isMobile } = useScreen();

  const filterCampaigns = useMemo(() => {
    const now = new Date();

    return campaigns.reduce<CategorizedCampaigns>(
      (acc, campaign) => {
        const startTime = new Date(campaign.startTime);
        const endTime = new Date(campaign.endTime);

        if (now >= startTime && now <= endTime) {
          acc.ongoing.push(campaign);
        } else if (now > endTime) {
          acc.past.push(campaign);
        } else {
          acc.future.push(campaign);
        }

        return acc;
      },
      { ongoing: [], past: [], future: [] }
    );
  }, [campaigns]);

  const options = useMemo(() => {
    const opts: { label: string; value: CategoryKey }[] = [
      { label: "Ongoing", value: "ongoing" },
      { label: "Past", value: "past" },
      { label: "Future", value: "future" },
    ];

    // Filter out categories with no campaigns and map to the required format
    return opts.filter((item) => filterCampaigns[item.value].length > 0);
  }, [filterCampaigns]);

  const currentCampaigns = useMemo(() => {
    const list = filterCampaigns[category];
    return list.map((campaign) => {
      const { startTime, endTime } = campaign;

      let learnMoreUrl: string;
      let tradingUrl = href?.trading!;

      if (typeof campaign.href === "object") {
        learnMoreUrl = campaign.href.learnMore;
        tradingUrl = campaign.href.trading;
      } else {
        learnMoreUrl = campaign.href;
      }

      return {
        ...campaign,
        displayTime: `${formatCampaignDate(startTime)} - ${formatCampaignDate(
          endTime
        )} UTC`,
        learnMoreUrl,
        tradingUrl,
      };
    });
  }, [filterCampaigns, category, href]);

  useEffect(() => {
    // Find the first non-empty category
    const categoryKeys: CategoryKey[] = ["ongoing", "past", "future"];

    const firstAvailableCategory = categoryKeys.find(
      (item) => filterCampaigns[item].length > 0
    );

    if (firstAvailableCategory) {
      setCategory(firstAvailableCategory);
    }
  }, [filterCampaigns]);

  const onCategoryChange = (value: string) => {
    setCategory(value as CategoryKey);
  };

  return {
    options,
    currentCampaigns,
    category,
    onCategoryChange,
    tradingUrl: href?.trading,
    isMobile,
  };
}
