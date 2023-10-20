import { modal } from "@/modal";
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import {
  useAccountInstance,
  useLocalStorage,
  OrderlyContext,
  useWalletSubscription,
  useWooCrossSwapQuery,
  useWooSwapQuery,
} from "@orderly.network/hooks";
import { toast } from "@/toast";
import { DepositAndWithdrawWithSheet } from "@/block/depositAndwithdraw/depositAndwithdraw";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
  onSettle: () => Promise<any>;

  // getBalance: (token: string) => Promise<any>;

  onEnquiry?: (inputs: any) => Promise<any>;

  visible: boolean;
  toggleVisible: () => void;
}

export const AssetsContext = createContext<AssetsContextState>(
  {} as AssetsContextState
);

export const AssetsProvider: FC<PropsWithChildren> = (props) => {
  const { configStore } = useContext<any>(OrderlyContext);
  const account = useAccountInstance();

  const onDeposit = useCallback(async () => {
    const result = await modal.show(DepositAndWithdrawWithSheet, {
      activeTab: "deposit",
    });
    console.log(result);
  }, []);

  const onWithdraw = useCallback(async () => {
    // 显示提现弹窗
    const result = await modal.show(DepositAndWithdrawWithSheet, {
      activeTab: "withdraw",
    });
    console.log(result);
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

  useWalletSubscription({
    onMessage: (data: any) => {
      // console.log("------- wallet -------", data);
      const { side, transStatus } = data;

      if (transStatus === "COMPLETED") {
        let msg = "";

        switch (side) {
          case "DEPOSIT":
            msg = "Deposit success";
            break;
          case "WITHDRAW":
            msg = "Withdraw success";
            break;
          default:
            msg = `${side} success}`;
        }
        toast.success(msg);
      }
    },
  });

  const { query: wooCrossSwapQuery } = useWooCrossSwapQuery();
  const { query: wooSwapQuery } = useWooSwapQuery();

  // const { trigger: onCrossChainSwapEnquiry } = useLazyQuery(
  //   `${configStore.get("swapSupportApiUrl")}/woofi_dex/cross_chain_swap`
  // );

  const onEnquiry = useCallback(
    (inputs: { needCrossChain: boolean; needSwap: boolean; params: any }) => {
      const { needCrossChain, needSwap, params } = inputs;

      if (needCrossChain) {
        return wooCrossSwapQuery(params);
      }

      if (needSwap) {
        return wooSwapQuery(params);
      }

      return Promise.reject("no need to enquiry");
    },
    []
  );

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
        onSettle,
        visible,
        toggleVisible,
        onEnquiry,
        // getBalance,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};
