import { AccountStatusEnum } from "@orderly.network/types";
import { useCallback } from "react";
import { useAccount } from "@orderly.network/hooks";

export const useWalletConnectorBuilder = () => {
  const { account, state, createOrderlyKey, createAccount } = useAccount();

  const signIn = useCallback(
    () => new Promise((resolve) => setTimeout(() => resolve(true), 3000)),
    []
  );
  return {
    enableTrading: createOrderlyKey,
    initAccountState: state.status,
    signIn,
  } as const;
};
