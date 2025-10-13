import { useState } from "react";
import { useOrderStream } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { modal, Text } from "@kodiak-finance/orderly-ui";
import { TabType } from "@kodiak-finance/orderly-ui-orders";
import { SharePnLConfig } from "@kodiak-finance/orderly-ui-share";
import {
  usePendingOrderCount,
  usePositionsCount,
  useTradingLocalStorage,
} from "../../../hooks";
import { useTradingPageContext } from "../../../provider/tradingPageContext";

export enum DataListTabType {
  position = "Position",
  pending = "Pending",
  tp_sl = "TP/SL",
  history = "History",
  liquidation = "Liquidation",
  assets = "Assets",
}

export enum DataListTabSubType {
  positionHistory = "Position history",
  orderHistory = "Order history",
}

export const useDataListScript = (props: {
  symbol: string;
  className?: string;
  sharePnLConfig?: SharePnLConfig;
}) => {
  const { symbol, sharePnLConfig } = props;
  const [tab, setTab] = useState<DataListTabType>(DataListTabType.position);
  const [subTab, setSubTab] = useState<DataListTabSubType>(
    DataListTabSubType.positionHistory,
  );
  const { t } = useTranslation();

  const { onSymbolChange } = useTradingPageContext();
  const localStorage = useTradingLocalStorage();

  const [_, { cancelAllOrders, cancelAllTPSLOrders }] = useOrderStream({});
  const { positionCount } = usePositionsCount(symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  const onCloseAll = (type: TabType) => {
    const title =
      type === TabType.pending
        ? t("orders.pending.cancelAll")
        : type === TabType.tp_sl
          ? t("orders.tpsl.cancelAll")
          : "";
    const content =
      type === TabType.pending
        ? t("orders.pending.cancelAll.description")
        : type === TabType.tp_sl
          ? t("orders.tpsl.cancelAll.description")
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
    subTab,
    setSubTab,
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
