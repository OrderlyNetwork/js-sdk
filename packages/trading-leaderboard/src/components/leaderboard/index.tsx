import { FC } from "react";
import { LeaderboardTitle } from "../../pages/leaderboard/page";
import { useTradingLeaderboardContext } from "../provider";
import { CampaignLeaderboardWidget } from "./campaignLeaderboard";
import { GeneralLeaderboardWidget } from "./generalLeaderboard";

interface LeaderboardWidgetProps {
  style?: React.CSSProperties;
  className?: string;
}

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useTradingLeaderboardContext();

  if (state.currentCampaignId === "general") {
    return <GeneralLeaderboardWidget {...props} />;
  }

  if (state.currentCampaign && state.currentCampaignId != "general") {
    return (
      <>
        <LeaderboardTitle title="Leaderboard" />
        <CampaignLeaderboardWidget
          {...props}
          campaignId={state.currentCampaignId}
        />
      </>
    );
  }

  return null;
};
