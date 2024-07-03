import { FundingHistoryUI } from "./fundingHistory.ui";
import { useFundingHistoryHook } from "./useDataSource.script";

export const FundingHistoryWidget = () => {
  const state = useFundingHistoryHook();
  return <FundingHistoryUI {...state} />;
};
