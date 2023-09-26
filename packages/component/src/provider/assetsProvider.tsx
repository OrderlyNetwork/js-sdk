import { modal } from "@/modal";
import { FC, PropsWithChildren, createContext, useCallback } from "react";
import { useAccountInstance, useLocalStorage } from "@orderly.network/hooks";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
  onSettle: () => Promise<any>;

  // getBalance: (token: string) => Promise<any>;

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
    // 显示提现弹窗
    return account.assetsManager.withdraw();
  }, []);

  const onSettle = useCallback(async () => {
    return account.settle();
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

  // const getBalance = useCallback(async (token: string) => {
  //   return account.assetsManager.getBalance(token);
  // }, []);

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
        onSettle,
        visible,
        toggleVisible,
        // getBalance,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};
