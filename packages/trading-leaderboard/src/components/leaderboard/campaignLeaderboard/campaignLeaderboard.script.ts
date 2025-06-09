import { useState } from "react";
import { TradingTab } from "../shared/LeaderboardTabs";

export type CampaignLeaderboardScriptReturn = ReturnType<
  typeof useCampaignLeaderboardScript
>;

export type CampaignLeaderboardScriptOptions = {};

export function useCampaignLeaderboardScript(
  options?: CampaignLeaderboardScriptOptions,
) {
  const [activeTab, setActiveTab] = useState<TradingTab>(TradingTab.Volume);

  return {
    activeTab,
    onTabChange: setActiveTab,
  };
}
