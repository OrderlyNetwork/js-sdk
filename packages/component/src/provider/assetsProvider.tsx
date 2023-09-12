import { modal } from "@/modal";
import { FC, PropsWithChildren, createContext, useCallback } from "react";
import { useAccountInstance, useLocalStorage } from "@orderly.network/hooks";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
  onSettlement: () => Promise<any>;

  visible: boolean;
  toggleVisible: () => void;
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

  const [visible, setVisible] = useLocalStorage<boolean>(
    "orderly_assets_visible",
    true
  );

  const toggleVisible = useCallback(() => {
    setVisible((visible: boolean) => {
      return !visible;
    });
  }, [visible]);

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
        onSettlement,
        visible,
        toggleVisible,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};
