import { modal } from "@/modal";
import { FC, PropsWithChildren, createContext, useCallback } from "react";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
}

export const AssetsContext = createContext<AssetsContextState>(
  {} as AssetsContextState
);

export const AssetsProvider: FC<PropsWithChildren> = (props) => {
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

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};
