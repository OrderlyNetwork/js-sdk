import { useRewardsHistoryScript } from "./rewardsHistory.script";
import { RewardsHistoryUI } from "./rewardsHistory.ui";

export const RewardsHistoryWidget = () => {
  const state = useRewardsHistoryScript();
  return <RewardsHistoryUI {...state} />;
};
