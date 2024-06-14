import { useEffect, useMemo, useState } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export const useAssetsBuilder = () => {
  const { connect, chains } = useWalletConnector();
  const { state } = useAccount();

  const connected = useMemo(() => {
    return state.status === AccountStatusEnum.EnableTrading;
  }, [state]);

  return {
    connected,
    connect,
  } as const;
};
