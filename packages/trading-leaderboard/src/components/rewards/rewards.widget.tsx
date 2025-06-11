import { LeaderboardTitle } from "../../pages/leaderboard/page";
import { useCampaignsScript } from "../campaigns/campaigns.script";
import { RewardsDesktopUI } from "./rewards.desktop.ui";

export const RewardsWidget = () => {
  const state = useCampaignsScript();

  if (state.currentCampaignId === "general") {
    return null;
  }

  return (
    <>
      <LeaderboardTitle title="Rewards" />
      <RewardsDesktopUI
        campaign={state.currentCampaign}
        userdata={state.userData}
        onLearnMore={state.onLearnMore}
        onTradeNow={state.onTradeNow}
      />
    </>
  );
};
