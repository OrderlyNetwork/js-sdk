import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { PositionsProps } from "@orderly.network/ui-positions";
import { useOrderStream } from "@orderly.network/hooks";
import { usePositionsCount } from "../../../provider/usePositionsCount";
import { usePendingOrderCount } from "../../../provider/usePendingOrderCount";
import { modal } from "@orderly.network/ui";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export enum DataListTabType {
  position = "Position",
  pending = "Pending",
  tp_sl = "TP/SL",
  history = "History",
}

export const useDataListScript = (props: {
  symbol: string;
  className?: string;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
}) => {
  const { symbol, sharePnLConfig } = props;
  // TODO: default tab should be position
  const [tab, setTab] = useState<DataListTabType>(DataListTabType.pending);
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
          className: "!oui-w-full",
        },
      },
      onCancel: () => {},
      onOk: async () => {
        try {
          // await cancelAll(null, { source_type: "ALL" });
          if (tab === DataListTabType.tp_sl) {
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
    sharePnLConfig,
    symbol,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    ...loalStorage,
    onCloseAll,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
