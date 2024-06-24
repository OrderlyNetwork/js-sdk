import { FundingHistoryUI } from "./fundingHistory.ui";
import { useDataSource } from "./userDataSource.script";

export const FundingHistoryWidget = () => {
  const state = useDataSource({});
  return <FundingHistoryUI {...state} />;
};
