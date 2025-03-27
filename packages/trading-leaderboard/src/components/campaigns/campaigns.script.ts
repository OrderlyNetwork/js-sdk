import { useEffect, useMemo, useState } from "react";
import { useTradingLeaderboardContext, Campaign } from "../provider";
import { useTranslation } from "@orderly.network/i18n";

export type CampaignsScriptReturn = ReturnType<typeof useCampaignsScript>;

// Define the type for our categorized campaigns
type CategorizedCampaigns = {
  ongoing: Campaign[];
  past: Campaign[];
  future: Campaign[];
};

type CategoryKey = keyof CategorizedCampaigns;

export function useCampaignsScript() {
  const { t } = useTranslation();
  const { campaigns = [], href } = useTradingLeaderboardContext();
  const [category, setCategory] = useState<CategoryKey>("ongoing");

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
      { label: t("tradingLeaderboard.ongoing"), value: "ongoing" },
      { label: t("tradingLeaderboard.past"), value: "past" },
      { label: t("tradingLeaderboard.future"), value: "future" },
    ];

    // Filter out categories with no campaigns and map to the required format
    return opts.filter((item) => filterCampaigns[item.value].length > 0);
  }, [filterCampaigns, t]);

  const currentCampaigns = useMemo(() => {
    return filterCampaigns[category];
  }, [filterCampaigns, category]);

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
  };
}
