import { useEffect, useMemo, useState } from "react";
import { useEventEmitter } from "@orderly.network/hooks";
import { API, OrderlyOrder } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";

export type ScaledOrderConfirmScriptOptions = {
  order: OrderlyOrder & {
    orders: OrderlyOrder[];
  };
  symbolInfo: API.SymbolExt;
};

export type ScaledOrderConfirmScriptReturns = ReturnType<
  typeof useScaledOrderConfirmScript
>;

export function useScaledOrderConfirmScript(
  options: ScaledOrderConfirmScriptOptions,
) {
  const { order, symbolInfo } = options;
  const orders = order.orders;

  const [askAndBid, setAskAndBid] = useState<number[]>();

  const ee = useEventEmitter();

  const national = useMemo(() => {
    const national = orders.reduce((acc, order) => {
      return acc.add(new Decimal(order.order_price).mul(order.order_quantity));
    }, zero);

    return national.toNumber();
  }, [orders]);

  const totalQuantity = useMemo(() => {
    const totalQuantity = orders.reduce((acc, order) => {
      return acc.add(new Decimal(order.order_quantity));
    }, zero);

    return totalQuantity.toString();
  }, [orders, symbolInfo.base_dp]);

  useEffect(() => {
    const onOrderBookUpdate = (data: any) => {
      const ask0 = data.asks?.[data.asks.length - 1]?.[0];
      const bid0 = data.bids?.[0]?.[0];
      setAskAndBid([ask0, bid0]);
    };
    ee.on("orderbook:update", onOrderBookUpdate);

    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
    };
  }, []);

  return { dataSource: orders, national, askAndBid, totalQuantity };
}
