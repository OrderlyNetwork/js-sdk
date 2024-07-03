import { DistributionHistoryUI } from "./distribution.ui";
import { useDistributionHistoryHook } from "./useDataSource.script";

export const DistributionHistoryWidget = () => {
  const state = useDistributionHistoryHook();
  return <DistributionHistoryUI {...state} />;
};
