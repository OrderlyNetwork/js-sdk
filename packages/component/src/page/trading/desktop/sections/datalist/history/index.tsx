import { HistoryListViewFull } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { useTabContext } from "@/tab/tabContext";
import { useOrderStream, useAccount } from "@orderly.network/hooks";
import { OrderEntity } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";

import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { useCallback, useContext, useMemo, useState } from "react";
import { useFormatOrderHistory } from "@/page/trading/shared/hooks/useFormatOrderHistory";

export const HistoryView = () => {
  const [side, setSide] = useState<OrderSide | "">("");
  const [status, setStauts] = useState<OrderStatus | "">("");
  const { state } = useAccount();
  const { symbol, onSymbolChange } = useContext(TradingPageContext);
  const { data: tabExtraData } = useTabContext();
  const [data, { isLoading, loadMore, cancelOrder, refresh, cancelAlgoOrder }] =
    useOrderStream({
      // @ts-ignore
      side,
      // @ts-ignore
      status,
      symbol: tabExtraData.showAllSymbol ? "" : symbol,
      size: 40,
    });

  const onCancelOrder = useCallback(
    (orderId: number | OrderEntity, symbol: string) => {
      console.log("orderId", orderId, symbol);
      // @ts-ignore
      return cancelOrder(orderId, symbol);
      // .then(() => {
      //   // update history list
      //   return refresh();
      // });
    },
    [refresh]
  );

  const formattedData = useFormatOrderHistory(
    state.status < AccountStatusEnum.EnableTrading || !data ? [] : data
  );

  console.log("formattedData", isLoading);

  return (
    <HistoryListViewFull
      isLoading={isLoading}
      // @ts-ignore
      dataSource={formattedData}
      onSideChange={setSide}
      onStatusChange={setStauts}
      onSymbolChange={onSymbolChange}
      onCancelOrder={onCancelOrder}
      onCancelAlgoOrder={cancelAlgoOrder}
      // cancelTPSLOrder={cancelTPSLOrder}
      side={side}
      status={status}
      loadMore={loadMore}
    />
  );
};
