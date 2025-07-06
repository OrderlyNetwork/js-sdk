import { order as orderUtils } from "@orderly.network/perp";
import {
  AlgoOrderRootType,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { OrderFactory } from "../../services/orderCreator/factory";

export const getCreateOrderUrl = (order: Partial<OrderlyOrder>): string => {
  const isAlgoOrder =
    order?.order_type === OrderType.STOP_LIMIT ||
    order?.order_type === OrderType.STOP_MARKET ||
    order?.order_type === OrderType.CLOSE_POSITION ||
    (order.algo_type && order.algo_type === AlgoOrderRootType.BRACKET) ||
    isBracketOrder(order);
  return isAlgoOrder ? "/v1/algo/order" : "/v1/order";
};

export const getOrderCreator = (order: Partial<OrderlyOrder>) => {
  let type;
  if (isBracketOrder(order)) {
    type = `${AlgoOrderRootType.BRACKET}:${order.order_type}`;
  } else if (order.order_type === OrderType.LIMIT) {
    type = order.order_type_ext || order.order_type;
  } else {
    type = order.order_type;
  }
  return OrderFactory.create(type!);
};

export const tpslFields = [
  "tp_trigger_price",
  "sl_trigger_price",
  "tp_pnl",
  "sl_pnl",
  "tp_offset",
  "sl_offset",
  "tp_offset_percentage",
  "sl_offset_percentage",
] as (keyof OrderlyOrder)[];

export const isBracketOrder = (order: Partial<OrderlyOrder>): boolean => {
  if (order.sl_enable || order.tp_enable) {
    return true;
  }
  return !!order.tp_trigger_price || !!order.sl_trigger_price;
};

export const hasTPSL = (order: Partial<OrderlyOrder>): boolean => {
  return tpslFields.some((field) => !!order[field]);
};

export const getPriceAndQty = (
  symbolOrOrder: Partial<OrderlyOrder>,
  askAndBid: number[],
): { quantity: number; price: number } | null => {
  let quantity = Number(symbolOrOrder.order_quantity);
  const orderPrice = Number(symbolOrOrder.order_price);

  if (isNaN(quantity) || quantity <= 0) {
    return null;
  }

  if (askAndBid.length === 0) {
    console.warn(
      "Please check if you are using the `useOrderbookStream` hook or if the orderBook has data.",
    );
    return null;
  }

  if (
    (symbolOrOrder.order_type === OrderType.LIMIT ||
      symbolOrOrder.order_type === OrderType.STOP_LIMIT) &&
    isNaN(orderPrice)
  )
    return null;

  /**
   * price
   * if order_type = market order,
   order side = long, then order_price_i = ask0
   order side = short, then order_price_i = bid0
   if order_type = limit order
   order side = long
   limit_price >= ask0, then order_price_i = ask0
   limit_price < ask0, then order_price_i = limit_price
   order side = short
   limit_price <= bid0, then order_price_i = bid0
   limit_price > ask0, then order_price_i = ask0
   */
  let price: number | undefined;

  if (
    symbolOrOrder.order_type === OrderType.MARKET ||
    symbolOrOrder.order_type === OrderType.STOP_MARKET
  ) {
    if (symbolOrOrder.side === OrderSide.BUY) {
      price = askAndBid[0];
    } else {
      price = askAndBid[1];
    }
  } else {
    // LIMIT order
    if (symbolOrOrder.side === OrderSide.BUY) {
      if (orderPrice >= askAndBid[0]) {
        price = askAndBid[0];
      } else {
        price = orderPrice;
      }
    } else {
      if (orderPrice <= askAndBid[1]) {
        price = askAndBid[1];
      } else {
        price = orderPrice;
      }
    }
  }

  if (symbolOrOrder.side === OrderSide.SELL) {
    quantity = -quantity;
  }

  return { price, quantity } as const;
};

export const calcEstLiqPrice = (
  order: Partial<OrderlyOrder>,
  askAndBid: number[],
  inputs: {
    futures_taker_fee_rate: number;
    imr_factor: number;
    symbol: string;
    baseIMR: number;
    baseMMR: number;
    totalCollateral: number;
    markPrice: number;
    positions: any;
  },
) => {
  const result = getPriceAndQty(order, askAndBid);

  if (!result) return null;

  const { price, quantity } = result;
  if (!price || !quantity) return null;

  const {
    symbol,
    baseIMR,
    baseMMR,
    imr_factor,
    markPrice,
    totalCollateral,
    futures_taker_fee_rate,
    positions,
  } = inputs;

  const orderFee = orderUtils.orderFee({
    qty: quantity,
    price,
    futuresTakeFeeRate: Number(futures_taker_fee_rate) / 10000,
  });

  const liqPrice = orderUtils.estLiqPrice({
    markPrice,
    baseIMR,
    baseMMR,
    totalCollateral,
    positions: positions == null ? [] : positions,
    IMR_Factor: imr_factor,
    orderFee,
    newOrder: {
      qty: quantity,
      price,
      symbol,
    },
  });

  // console.log("********", liqPrice, markPrice, totalCollateral, result);

  if (liqPrice <= 0) return null;

  return liqPrice;
};

export const calcEstLeverage = (
  order: Partial<OrderlyOrder>,
  askAndBid: number[],
  inputs: {
    totalCollateral: number;
    positions: any;
    symbol: string;
  },
) => {
  const result = getPriceAndQty(order, askAndBid);
  const { totalCollateral, positions, symbol } = inputs;

  if (!result) return null;

  const { price, quantity } = result;
  if (!price || !quantity) return null;

  return orderUtils.estLeverage({
    totalCollateral,
    positions,
    newOrder: {
      symbol,
      qty: result.quantity,
      price: result.price,
    },
  });
};

export function isBBOOrder(options: {
  order_type?: OrderType;
  order_type_ext?: OrderType;
}) {
  const { order_type, order_type_ext } = options;

  return (
    order_type === OrderType.LIMIT &&
    [OrderType.ASK, OrderType.BID].includes(order_type_ext!)
  );
}
