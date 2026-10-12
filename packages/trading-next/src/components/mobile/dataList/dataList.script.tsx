import { useState } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { OrderStatus } from "@orderly.network/types";
import { modal, Text } from "@orderly.network/ui";
import { TabType } from "@orderly.network/ui-orders";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { formatSymbol } from "@orderly.network/utils";
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

  // Scoped to PERP pending orders: unscoped cancel-all would also cancel
  // Binary prediction orders (DELETE /v1/orders has no product filter), so
  // the hook enumerates per-symbol targets from this stream.
  // Known limitation: size=500 does not prove all symbols are loaded (algo
  // queries use size=100). TODO: Verify both streams are complete before
  // enabling all-symbol cancellation; unloaded streams currently resolve empty.
  const [_, { cancelAllPendingOrders, cancelAllTPSLOrders }] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    productType: "PERP",
    size: 500,
  });
  const { positionCount } = usePositionsCount(symbol);
  const { pendingOrderCount, tpSlOrderCount } = usePendingOrderCount(symbol);

  const onCloseAll = (type: TabType) => {
    const { title, content } = getDialogInfo(
      type,
      t,
      localStorage.showAllSymbol ? undefined : symbol,
    );
    modal.confirm({
      title: title,
      content: <Text size="2xs">{content}</Text>,

      onOk: async () => {
        try {
          // await cancelAll(null, { source_type: "ALL" });
          if (tab === DataListTabType.tp_sl) {
            await cancelAllTPSLOrders(
              localStorage.showAllSymbol ? undefined : symbol,
            );
          } else {
            await cancelAllPendingOrders(
              localStorage.showAllSymbol ? undefined : symbol,
            );
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

type TranslationFn = (...args: any[]) => string;

const getDialogInfo = (type: TabType, t: TranslationFn, symbol?: string) => {
  // symbol like this: PERP_BTC_USDC, but i want to show BTC, pls help me to format the symbol
  const formattedSymbol = symbol ? formatSymbol(symbol, "base") : symbol;
  switch (type) {
    case TabType.pending:
      if (symbol !== undefined) {
        return {
          title: t("orders.pending.cancelAll.forSymbol", {
            symbol: formattedSymbol,
          }),
          content: t("orders.pending.cancelAll.forSymbol.description", {
            symbol: formattedSymbol,
          }),
        };
      }
      return {
        title: t("orders.pending.cancelAll"),
        content: t("orders.pending.cancelAll.description"),
      };
    case TabType.tp_sl:
      if (symbol !== undefined) {
        return {
          title: t("orders.tpsl.cancelAll.forSymbol", {
            symbol: formattedSymbol,
          }),
          content: t("orders.tpsl.cancelAll.forSymbol.description", {
            symbol: formattedSymbol,
          }),
        };
      }
      return {
        title: t("orders.tpsl.cancelAll"),
        content: t("orders.tpsl.cancelAll.description"),
      };
    default:
      return {
        title: "",
        content: "",
      };
  }
};
