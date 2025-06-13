import { useScreen } from "@orderly.network/ui";
import { LeaderboardTitle } from "../../pages/leaderboard/page";
import { useCampaignsScript } from "../campaigns/campaigns.script";
import { RewardsDesktopUI } from "./rewards.desktop.ui";

export const RewardsWidget = () => {
  const state = useCampaignsScript();
  const { isMobile } = useScreen();

  if (state.currentCampaignId === "general") {
    return null;
  }

  return (
    <>
      <LeaderboardTitle title="Rewards" isMobile={isMobile} />
      <RewardsDesktopUI
        campaign={state.currentCampaign}
        userdata={state.userData}
        onLearnMore={state.onLearnMore}
        onTradeNow={state.onTradeNow}
        isMobile={isMobile}
      />
    </>
  );
};
