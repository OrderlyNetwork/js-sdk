import { order as orderUtils } from "@orderly.network/perp";
import {
  AlgoOrderRootType,
  API,
  DistributionType,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { OrderEntity } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { OrderFactory } from "../../services/orderCreator/factory";

export const getCreateOrderUrl = (order: Partial<OrderlyOrder>): string => {
  const isAlgoOrder =
    order?.order_type === OrderType.STOP_LIMIT ||
    order?.order_type === OrderType.STOP_MARKET ||
    order?.order_type === OrderType.CLOSE_POSITION ||
    (order.algo_type && order.algo_type === AlgoOrderRootType.BRACKET) ||
    isBracketOrder(order);

  // scaled order will create multiple orders, so it is a batch order
  if (order.order_type === OrderType.SCALED) {
    return "/v1/batch-order";
  }

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
  return !!order.tp_trigger_price || !!order.sl_trigger_price;
};

export const hasTPSL = (order: Partial<OrderlyOrder>): boolean => {
  return tpslFields.some((field) => !!order[field]);
};

/**
 * if order_type = market order,
 * order side = buy/long, then order_price_i = ask0
 * order side = sell/short, then order_price_i = bid0
 * if order_type = limit order
 * order side = buy/long
 * limit_price >= ask0, then order_price_i = ask0
 * limit_price < ask0, then order_price_i = limit_price
 * order side = sell/short
 * limit_price <= bid0, then order_price_i = bid0
 * limit_price > ask0, then order_price_i = ask0
 */
function getOrderPrice(order: Partial<OrderlyOrder>, askAndBid: number[]) {
  const orderPrice = Number(order.order_price);
  if (
    order.order_type === OrderType.MARKET ||
    order.order_type === OrderType.STOP_MARKET
  ) {
    if (order.side === OrderSide.BUY) {
      return askAndBid[0];
    } else {
      return askAndBid[1];
    }
  } else {
    // LIMIT order
    if (order.side === OrderSide.BUY) {
      if (orderPrice >= askAndBid[0]) {
        return askAndBid[0];
      } else {
        return orderPrice;
      }
    } else {
      if (orderPrice <= askAndBid[1]) {
        return askAndBid[1];
      } else {
        return orderPrice;
      }
    }
  }
}

export const getPriceAndQty = (
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
  askAndBid: number[],
) => {
  let quantity = Number(order.order_quantity);
  const orderPrice = Number(order.order_price);

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
    (order.order_type === OrderType.LIMIT ||
      order.order_type === OrderType.STOP_LIMIT) &&
    isNaN(orderPrice)
  ) {
    return null;
  }

  let price: number | null;

  if (order.order_type === OrderType.SCALED) {
    price = calcScaledOrderAvgOrderPrice(order, symbolInfo, askAndBid);
    const orders = calcScaledOrderBatchBody(order, symbolInfo);

    const sumQtys = orders.reduce((acc, order) => {
      return acc.plus(new Decimal(order.order_quantity!));
    }, zero);

    quantity = sumQtys.todp(symbolInfo.base_dp).toNumber();

    // revalidate quantity
    if (!quantity || isNaN(quantity)) {
      return null;
    }
  } else {
    price = getOrderPrice(order, askAndBid);
  }

  if (!price || isNaN(price)) {
    return null;
  }

  if (order.side === OrderSide.SELL) {
    quantity = -quantity;
  }

  return { price, quantity };
};

export const calcEstLiqPrice = (
  order: Partial<OrderlyOrder>,
  askAndBid: number[],
  inputs: {
    futures_taker_fee_rate: number;
    imr_factor: number;
    symbol: string;
    totalCollateral: number;
    markPrice: number;
    positions: any;
    symbolInfo: API.SymbolExt;
  },
) => {
  const { symbolInfo } = inputs;
  const result = getPriceAndQty(order, symbolInfo, askAndBid);

  if (!result) return null;

  const { price, quantity } = result;
  if (!price || !quantity) return null;

  const {
    symbol,
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
    baseIMR: symbolInfo.base_imr,
    baseMMR: symbolInfo.base_mmr,
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
    symbolInfo: API.SymbolExt;
  },
) => {
  const { totalCollateral, positions, symbol, symbolInfo } = inputs;

  const result = getPriceAndQty(order, symbolInfo, askAndBid);

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

/**
 * priceStep = (maxPrice - minPrice) / (totalOrders - 1)
 * price[i] = minPrice + i × priceStep
 */
export function calcScaledOrderPrices(inputs: {
  min_price?: string;
  max_price?: string;
  total_orders?: number;
  quote_dp: number;
}) {
  const { min_price, max_price, total_orders, quote_dp } = inputs;

  if (!min_price || !max_price || !total_orders) {
    return [];
  }

  const minPrice = new Decimal(min_price);
  const maxPrice = new Decimal(max_price);
  const totalOrders = Number(total_orders);

  const priceStep = maxPrice.minus(minPrice).div(totalOrders - 1);

  const prices = [];

  for (let i = 0; i < totalOrders; i++) {
    prices[i] = minPrice.plus(priceStep.mul(i)).todp(quote_dp).toString();
  }

  return prices;
}

export function getScaledOrderSkew(inputs: {
  skew: number;
  distribution_type: DistributionType;
  total_orders: number;
}) {
  const { skew, distribution_type, total_orders } = inputs;

  if (distribution_type === DistributionType.FLAT) {
    return 1;
  } else if (distribution_type === DistributionType.ASCENDING) {
    return total_orders;
  } else if (distribution_type === DistributionType.DESCENDING) {
    return 1 / total_orders;
  }

  return skew;
}

/**
 * weights[i] = 1 + (skew - 1) × (i / (totalOrders - 1)) *
 */
export function calcScaledOrderWeights(inputs: {
  total_orders?: number;
  distribution_type?: DistributionType;
  skew?: number;
}) {
  const { total_orders, distribution_type, skew } = inputs;

  const weights: number[] = [];

  if (
    !total_orders ||
    !distribution_type ||
    (distribution_type === DistributionType.CUSTOM &&
      (!skew || skew <= 0 || skew > 100))
  ) {
    return {
      weights: [],
      sumWeights: 0,
      minWeight: 0,
    };
  }

  const totalOrders = Number(total_orders);

  const skewNum = getScaledOrderSkew({
    skew: skew!,
    distribution_type,
    total_orders: totalOrders,
  });

  for (let i = 0; i < totalOrders; i++) {
    weights[i] = 1 + ((skewNum - 1) * i) / (totalOrders - 1);
  }

  const sumWeights = weights.reduce((acc, cur) => acc + cur, 0);

  // Find the min weight
  const minWeight = weights.reduce(
    (min, current) => (current < min ? current : min),
    weights?.[0],
  );

  return {
    weights,
    sumWeights,
    minWeight,
  };
}

/**
 * qty[i] = (weights[i] / sum(weights)) × totalAmount
 */
export function calcScaledOrderQtys(inputs: {
  side?: OrderSide;
  order_quantity?: string;
  total_orders?: number;
  distribution_type?: DistributionType;
  skew?: number;
  base_dp: number;
}) {
  const {
    order_quantity = 0,
    total_orders = 0,
    distribution_type,
    skew,
    base_dp,
  } = inputs;
  const qtys = [];

  if (!order_quantity || !total_orders) {
    return [];
  }

  const { weights, sumWeights } = calcScaledOrderWeights({
    total_orders,
    distribution_type,
    skew,
  });

  for (let i = 0; i < total_orders; i++) {
    qtys[i] = new Decimal(order_quantity)
      .mul(weights[i])
      .div(sumWeights)
      .todp(base_dp)
      .toString();
  }

  return qtys;
}

export function calcScaledOrderBatchBody(
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
) {
  if (!validateScaledOrderInput(order)) {
    return [];
  }

  try {
    const { base_dp, quote_dp } = symbolInfo;

    const {
      symbol,
      side,
      order_quantity,
      min_price,
      max_price,
      total_orders,
      distribution_type,
      skew,
      reduce_only,
      visible_quantity,
    } = order;

    const prices = calcScaledOrderPrices({
      min_price,
      max_price,
      total_orders,
      quote_dp,
    });

    const qtys = calcScaledOrderQtys({
      side,
      order_quantity,
      total_orders,
      distribution_type,
      skew,
      base_dp,
    });

    const now = Date.now();
    const orders = prices.map((price, index) => {
      const subOrder: Partial<OrderlyOrder> = {
        symbol,
        side,
        // this order type is scaled order, so we need to set the order type to limit
        order_type: OrderType.LIMIT,
        order_quantity: qtys[index],
        order_price: price,
        reduce_only,
        // it will be used for identify the scaled order from ws
        client_order_id: `scaled_${index}_${now}`,
      };
      // if visible_quantity is 0, set visible_quantity to 0
      if (visible_quantity === 0) {
        subOrder.visible_quantity = visible_quantity;
      }
      return subOrder;
    });

    return orders;
  } catch (error) {
    console.error("calcScaledOrdersBody error", error);
    return [];
  }
}

/**
 * avg_order_price = sum(order_price_i * qty_i) / sum(qty_i)
 */
export function calcScaledOrderAvgOrderPrice(
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
  askAndBid: number[],
) {
  if (!validateScaledOrderInput(order)) {
    return null;
  }

  try {
    const orders = calcScaledOrderBatchBody(order, symbolInfo);

    const sumQtys = orders.reduce((acc, order) => {
      return acc.plus(new Decimal(order.order_quantity!));
    }, zero);

    const totalNational = orders.reduce((acc, order) => {
      const orderPrice = getOrderPrice(order, askAndBid);
      return acc.plus(new Decimal(orderPrice).mul(order.order_quantity!));
    }, zero);

    return totalNational.div(sumQtys).todp(symbolInfo.quote_dp).toNumber();
  } catch (error) {
    console.error("calcScaledOrderAvgOrderPrice error", error);
    return null;
  }
}

export function validateScaledOrderInput(order: Partial<OrderlyOrder>) {
  const {
    min_price,
    max_price,
    order_quantity,
    total_orders,
    distribution_type,
    skew,
  } = order;
  if (
    !min_price ||
    !max_price ||
    !order_quantity ||
    !total_orders ||
    !distribution_type ||
    (distribution_type === DistributionType.CUSTOM &&
      (!skew || skew <= 0 || skew > 100)) ||
    total_orders < 2 ||
    total_orders > 20
  ) {
    return false;
  }

  return true;
}

export function calcScaledOrderMinTotalAmount(
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
  askAndBid: number[],
) {
  try {
    const minTotalAmount_baseMin = calcScaledOrderMinTotalAmountByBaseMin(
      order,
      symbolInfo,
    );

    const minTotalAmount_minNotional =
      calcScaledOrderMinTotalAmountByMinNotional(order, symbolInfo, askAndBid);

    const minTotalAmount = Math.max(
      minTotalAmount_baseMin,
      minTotalAmount_minNotional,
    );

    return minTotalAmount;
  } catch (error) {
    console.error("calcScaledOrderMinTotalAmount error", error);
    return null;
  }
}
/**
 * minWeight / sum(weights)) × totalAmount ≥ base_min
 * totalAmount ≥ base_min × (sum(weights) / minWeight), value need to ceil
 * totalAmount ≥ max ((min_notional x sum(weights)) / (weights[i] x order_price[i]))
 */
export function calcScaledOrderMinTotalAmountByBaseMin(
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
) {
  const { total_orders, distribution_type, skew } = order;
  const { base_min, base_dp } = symbolInfo;

  const { sumWeights, minWeight } = calcScaledOrderWeights({
    total_orders,
    distribution_type,
    skew,
  });

  const minTotalAmount = new Decimal(base_min)
    .mul(new Decimal(sumWeights).div(minWeight))
    .todp(base_dp, Decimal.ROUND_UP)
    .toNumber();

  return minTotalAmount;
}

export function calcScaledOrderMinTotalAmountByMinNotional(
  order: Partial<OrderlyOrder>,
  symbolInfo: API.SymbolExt,
  askAndBid: number[],
) {
  const { base_dp, min_notional } = symbolInfo;

  const orders = calcScaledOrderBatchBody(order, symbolInfo);

  const { total_orders, distribution_type, skew } = order;

  const { weights, sumWeights } = calcScaledOrderWeights({
    total_orders,
    distribution_type,
    skew,
  });

  const minQtys = orders.map((order, i) => {
    const orderPrice = getOrderPrice(order, askAndBid);
    return new Decimal(min_notional)
      .mul(sumWeights)
      .div(new Decimal(weights[i]).mul(orderPrice));
  });

  // Find the max minQty
  const max_minQty = minQtys.reduce(
    (max, current) => (current.gt(max) ? current : max),
    minQtys?.[0],
  );

  return max_minQty.todp(base_dp, Decimal.ROUND_UP).toNumber();
}

/**
 * group orders , it is used for batch order, default is 10 orders per group
 */
// export function groupOrders(arr: any[], size = 10) {
//   const result = [];
//   for (let i = 0; i < arr.length; i += size) {
//     result.push(arr.slice(i, i + size));
//   }
//   return result;
// }
