import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { TransferHistoryUI } from "./transfer.ui";
import { useTransferHistoryHook } from "./useDataSource.script";

export const TransferHistoryWidget: React.FC = () => {
  const state = useTransferHistoryHook();
  const accountState = useAccount();
  return <TransferHistoryUI {...state} {...accountState} />;
};
