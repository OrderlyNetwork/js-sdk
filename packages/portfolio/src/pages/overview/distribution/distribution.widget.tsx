import React from "react";
import { DistributionHistoryUI } from "./distribution.ui";
import { useDistributionHistoryHook } from "./useDataSource.script";

export const DistributionHistoryWidget: React.FC = () => {
  const state = useDistributionHistoryHook();
  return <DistributionHistoryUI {...state} />;
};
