import { HistoryListViewFull } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { useTabContext } from "@/tab/tabContext";
import { useOrderStream, useAccount } from "@orderly.network/hooks";

import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { useCallback, useContext, useState } from "react";

export const HistoryView = () => {
  const [side, setSide] = useState<OrderSide | "">("");
  const [status, setStauts] = useState<OrderStatus | "">("");
  const { state } = useAccount();
  const { symbol, onSymbolChange } = useContext(TradingPageContext);
  const { data: tabExtraData } = useTabContext();
  const [data, { isLoading, loadMore, cancelOrder, refresh }] = useOrderStream({
    // @ts-ignore
    side,
    // @ts-ignore
    status,
    symbol: tabExtraData.showAllSymbol ? "" : symbol,
  });

  const onCancelOrder = useCallback(
    (orderId: number, symbol: string) => {
      return cancelOrder(orderId, symbol).then(() => {
        // update history list
        return refresh();
      });
    },
    [refresh]
  );

  return (
    <HistoryListViewFull
      isLoading={isLoading}
      // @ts-ignore
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      onSideChange={setSide}
      onStatusChange={setStauts}
      onSymbolChange={onSymbolChange}
      onCancelOrder={onCancelOrder}
      side={side}
      status={status}
      loadMore={loadMore}
    />
  );
};
