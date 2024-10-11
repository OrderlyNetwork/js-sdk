import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { PositionsProps } from "@orderly.network/ui-positions";
import { usePositionsCount } from "../../../provider/usePositionsCount";
import { usePendingOrderCount } from "../../../provider/usePendingOrderCount";
import { modal } from "@orderly.network/ui";
import { useOrderStream } from "@orderly.network/hooks";

export enum BottomTabType {
  position = "Position",
  pending = "Pending",
  tp_sl = "TP/SL",
  history = "History",
}

export const useBottomTabScript = (props: {
  symbol: string;
  config: Partial<Omit<PositionsProps, "pnlNotionalDecimalPrecision">>;
}) => {
  const { symbol, config } = props;
  // TODO: default tab should be position
  const [tab, setTab] = useState<BottomTabType>(BottomTabType.pending);
  const { tabletMediaQuery } = useTradingPageContext();
  const loalStorage = useTradingLocalStorage();

  const [_, { cancelAllOrders, cancelAllTPSLOrders }] = useOrderStream({});
  const { positionCount } = usePositionsCount(symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  const onCloseAll = () => {
    modal.alert({
      title: "Cancel all orders",
      okLabel: "Confirm",
      message:
        "Are you sure you want to cancel all of your pending orders, including TP/SL orders?",
        actions: {
          secondary: {
            fullWidth: true,
          },
          primary: {
            className: "!oui-w-full"
          },
        },
      onCancel: () => {},
      onOk: async () => {
        try {
          // await cancelAll(null, { source_type: "ALL" });
          if (tab === BottomTabType.tp_sl) {
            await cancelAllTPSLOrders();
          } else {
            await cancelAllOrders();
          }
          return Promise.resolve(true);
        } catch (error) {
          // @ts-ignore
          if (error?.message !== undefined) {
            // @ts-ignore
            toast.error(error.message);
          }
          return Promise.resolve(false);
        } finally {
          Promise.resolve();
        }
      },
    });
  };

  return {
    tab,
    setTab,
    tabletMediaQuery,
    config,
    symbol,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    ...loalStorage,
    onCloseAll,
  };
};

export type BottomTabState = ReturnType<typeof useBottomTabScript>;
