import { useRewardsHistoryScript } from "./rewardsHistory.script";
import { RewardHistory } from "./rewardsHistory.ui";

export const RewardsHistoryWidget = () => {
  const state = useRewardsHistoryScript();
  return <RewardHistory {...state} />;
};
