import { FundingHistoryUI } from "./fundingHistory.ui";
import { useFundingHistoryHook } from "./userDataSource.script";

export const FundingHistoryWidget = () => {
  const state = useFundingHistoryHook({});
  return <FundingHistoryUI {...state} />;
};
