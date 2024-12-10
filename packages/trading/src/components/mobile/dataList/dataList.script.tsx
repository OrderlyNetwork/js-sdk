import { useState } from "react";
import { useTradingPageContext } from "../../../provider/context";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { PositionsProps } from "@orderly.network/ui-positions";
import { useOrderStream } from "@orderly.network/hooks";
import { usePositionsCount } from "../../../provider/usePositionsCount";
import { usePendingOrderCount } from "../../../provider/usePendingOrderCount";
import { modal, Text } from "@orderly.network/ui";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
import { TabType } from "@orderly.network/ui-orders";

export enum DataListTabType {
  position = "Position",
  pending = "Pending",
  tp_sl = "TP/SL",
  history = "History",
}

export enum DataListTabSubType {
  positionHistory = "Position history",
  orderHistory = "Order history",
}

export const useDataListScript = (props: {
  symbol: string;
  className?: string;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
}) => {
  const { symbol, sharePnLConfig } = props;
  const [tab, setTab] = useState<DataListTabType>(DataListTabType.position);
  const [subTab, setSubTab] = useState<DataListTabSubType>(DataListTabSubType.positionHistory);
  const { tabletMediaQuery, onSymbolChange } = useTradingPageContext();
  const localStorage = useTradingLocalStorage();

  const [_, { cancelAllOrders, cancelAllTPSLOrders }] = useOrderStream({});
  const { positionCount } = usePositionsCount(symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  const onCloseAll = (type: TabType) => {
    const title =
      type === TabType.pending
        ? "Cancel all pending orders"
        : type === TabType.tp_sl
        ? "Cancel all TP/SL orders"
        : "";
    const content =
      type === TabType.pending
        ? "Are you sure you want to cancel all of your pending orders?"
        : type === TabType.tp_sl
        ? "Are you sure you want to cancel all of your TP/SL orders?"
        : "";
    modal.confirm({
      title: title,
      content: <Text size="2xs">{content}</Text>,

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
    subTab, setSubTab,
    tabletMediaQuery,
    sharePnLConfig,
    symbol,
    positionCount,
    pendingOrderCount,
    tpSlOrderCount,
    ...localStorage,
    onCloseAll,
    onSymbolChange,
  };
};

export type DataListState = ReturnType<typeof useDataListScript>;
