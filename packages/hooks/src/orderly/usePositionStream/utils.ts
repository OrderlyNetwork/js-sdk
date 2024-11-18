import {
  API,
  AlgoOrderEntity,
  AlgoOrderType,
  AlgoOrderRootType,
  OrderStatus,
} from "@orderly.network/types";

export const findTPSLFromOrders = (
  orders: API.AlgoOrder[],
  symbol: string
): Partial<AlgoOrderEntity> | undefined => {
  const order = findPositionTPSLFromOrders(orders, symbol);

  // console.log("!!!!!", order);

  if (!order) return;
  return findTPSLFromOrder(order);
};

export const findTPSLFromOrder = (
  order: API.AlgoOrder
): {
  tp_trigger_price?: number;
  sl_trigger_price?: number;
} => {
  let tp_trigger_price;

  let sl_trigger_price;

  const tpOrder = order?.child_orders?.find(
    (order: any) => order.algo_type === AlgoOrderType.TAKE_PROFIT
  );
  const slOrder = order?.child_orders?.find(
    (order: any) => order.algo_type === AlgoOrderType.STOP_LOSS
  );

  if (tpOrder) {
    tp_trigger_price = tpOrder.trigger_price;
    // take_profit_qty =  tpOrder.quantity ;
  }
  if (slOrder) {
    sl_trigger_price = slOrder.trigger_price;
    // stop_loss_qty = slOrder.quantity;
  }

  return {
    tp_trigger_price,
    sl_trigger_price,
  };
};

export const findPositionTPSLFromOrders = (
  orders: API.AlgoOrder[],
  symbol: string
): API.AlgoOrder | undefined => {
  return orders?.find((order) => {
    // console.log(order.symbol, symbol, order.algo_type);
    return (
      order.symbol === symbol &&
      order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
      (order.root_algo_status === OrderStatus.NEW ||
        order.root_algo_status === OrderStatus.REPLACED ||
        order.root_algo_status === OrderStatus.PARTIAL_FILLED)
    );
  });

  // return order;
};
