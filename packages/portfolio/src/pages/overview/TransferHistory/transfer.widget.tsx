import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";
import { TransferHistoryMobileUI } from "./transfer.mobile.ui";
import { TransferHistoryUI } from "./transfer.ui";
import { useTransferHistoryHook } from "./useDataSource.script";

export const TransferHistoryWidget: React.FC = () => {
  const state = useTransferHistoryHook();
  const accountState = useAccount();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <TransferHistoryMobileUI {...state} {...accountState} />;
  }
  return <TransferHistoryUI {...state} {...accountState} />;
};
