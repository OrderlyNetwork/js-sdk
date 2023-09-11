import { modal } from "@/modal";
import { FC, PropsWithChildren, createContext, useCallback } from "react";
import { useAccountInstance } from "@orderly.network/hooks";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
  onSettlement: () => Promise<any>;
}

export const AssetsContext = createContext<AssetsContextState>(
  {} as AssetsContextState
);

export const AssetsProvider: FC<PropsWithChildren> = (props) => {
  const account = useAccountInstance();
  const onDeposit = useCallback(async () => {
    modal.sheet({
      title: "Deposit",
      content: "Deposit",
    });
  }, []);

  const onWithdraw = useCallback(async () => {
    modal.sheet({
      title: "Withdraw",
      content: "Withdraw",
    });
  }, []);

  const onSettlement = useCallback(async () => {
    return account.settlement();
  }, []);

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
        onSettlement,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};
