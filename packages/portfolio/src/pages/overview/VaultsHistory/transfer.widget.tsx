import React from "react";
import { VaultsHistoryUI } from "./transfer.ui";
import { useVaultsHistoryHook } from "./useDataSource.script";

export const VaultsHistoryWidget: React.FC = () => {
  const state = useVaultsHistoryHook();
  return <VaultsHistoryUI {...state} />;
};
