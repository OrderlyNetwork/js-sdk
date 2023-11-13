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
  useExecutionReport,
  useWooCrossSwapQuery,
  useWooSwapQuery,
  useEventEmitter,
  useSymbolsInfo,
  useWS,
} from "@orderly.network/hooks";
import { toast } from "@/toast";
import { DepositAndWithdrawWithSheet } from "@/block/depositAndwithdraw/depositAndwithdraw";
import {
  capitalizeString,
  transSymbolformString,
} from "@orderly.network/utils";
import { getOrderExecutionReportMsg } from "../block/orders/getOrderExecutionReportMsg";

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

  const ws = useWS();

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
      } else if (transStatus === "FAILED") {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      console.log("settle ws: ", data);

      switch (status) {
        case "COMPLETED":
          toast.success("Settlement completed");
          break;
        case "FAILED":
          toast.error("Settlement failed");
          break;
        default:
          break;
      }
    },
  });

  const symbolsInfo = useSymbolsInfo();

  useEffect(() => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "executionreport",
        event: "subscribe",
        topic: "executionreport",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          console.log("executionreport", data);
          const { title, msg } = getOrderExecutionReportMsg(data, symbolsInfo);
          if (title && msg) {
            toast.success(
              <div>
                {title}
                <br />
                <div className="text-white/[0.54]">{msg}</div>
              </div>
            );
          }
        },
      }
    );
    return () => unsubscribe();
  }, [symbolsInfo.symbol]);

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
