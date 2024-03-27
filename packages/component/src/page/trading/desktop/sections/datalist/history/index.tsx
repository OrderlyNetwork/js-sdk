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

  const formattedData = useMemo(() => {
    if (state.status < AccountStatusEnum.EnableTrading || !data) {
      return [];
    }
    const _data = [];

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      // console.log("element", element);
      if (
        element.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL ||
        element.algo_type === AlgoOrderRootType.TP_SL
      ) {
        if (element.algo_status !== OrderStatus.FILLED) {
          for (let j = 0; j < element.child_orders.length; j++) {
            const e = element.child_orders[j];
            e.parent_algo_type = element.algo_type;
            _data.push(e);
          }
        } else {
          // if order is filled then show only the filled order
          for (let j = 0; j < element.length; j++) {
            const e = element[j];

            if (e.is_triggered) {
              e.parent_algo_type = element.algo_type;
              _data.push(e);
            }
          }
        }
      } else {
        _data.push(element);
      }
    }

    return _data;

    // data.map((item) => {});
  }, [data]);

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
