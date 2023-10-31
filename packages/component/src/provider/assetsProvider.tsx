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
  useSettleSubscription,
  useWooCrossSwapQuery,
  useWooSwapQuery,
  useEventEmitter,
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
  }, []);

  const ee = useEventEmitter();

  const onWithdraw = useCallback(async () => {
    // 显示提现弹窗
    const result = await modal.show(DepositAndWithdrawWithSheet, {
      activeTab: "withdraw",
    });
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
      //
      const { side, transStatus } = data;

      if (transStatus === "COMPLETED") {
        let msg = `${capitalizeString(side)} success`;
        toast.success(msg);
      } else if(transStatus === "FAILED") {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });

  useSettleSubscription({
    onMessage: (data: any) => {

      const { status } = data;

      console.log('settle ws: ', data);

      switch(status) {
        case "COMPLETED":
          toast.success("Settlement success");
          break;
        case "FAILED":
          toast.error("Settlement failed");
          break;   
          default: 
          break;  
      }
    },
  });

  const { query: wooCrossSwapQuery } = useWooCrossSwapQuery();
  const { query: wooSwapQuery } = useWooSwapQuery();

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


function capitalizeString(str: string): string {
  // 将字符串全部转换为小写
  const lowercaseStr: string = str.toLowerCase();
  // 将第一个字符转换为大写
  const capitalizedStr: string = lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1);
  return capitalizedStr;
}