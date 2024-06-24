import { DistributionHistoryUI } from "./distribution.ui";
import { useDataSource } from "./userDataSource.script";

export const DistributionHistoryWidget = () => {
  const state = useDataSource({});
  return <DistributionHistoryUI {...state} />;
};
