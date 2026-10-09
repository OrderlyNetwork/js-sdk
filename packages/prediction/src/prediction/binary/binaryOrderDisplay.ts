import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import type { PredictionOpenOrder } from "../prediction.types";
import { binaryRoundFromSymbol } from "./binaryInfo";

export const toPredictionOrder = (order: API.Order): PredictionOpenOrder => ({
  id: order.order_id,
  outcome: order.side === OrderSide.BUY ? "up" : "down",
  side: order.side === OrderSide.BUY ? "buy" : "sell",
  type: [
    OrderType.LIMIT,
    OrderType.POST_ONLY,
    OrderType.BID,
    OrderType.ASK,
  ].includes(order.type as OrderType)
    ? "limit"
    : "market",
  orderType: order.type,
  clientOrderId: order.client_order_id,
  orderTag: order.order_tag,
  price: Number(order.price ?? 0),
  quantity: Number(order.quantity ?? 0),
  filledQuantity: Number(order.total_executed_quantity ?? 0),
  averagePrice:
    Number.isFinite(order.average_executed_price) &&
    order.total_executed_quantity > 0
      ? order.average_executed_price
      : undefined,
  totalFee: Number.isFinite(order.total_fee) ? order.total_fee : undefined,
  feeAsset: order.fee_asset,
  reduceOnly: order.reduce_only,
  symbol: order.symbol,
  round: binaryRoundFromSymbol(order.symbol, order.created_time) ?? 0,
  timestamp: order.created_time,
  status:
    order.status === OrderStatus.FILLED
      ? "filled"
      : order.status === OrderStatus.CANCELLED
        ? "cancelled"
        : order.status === OrderStatus.REJECTED
          ? "rejected"
          : order.status === OrderStatus.PARTIAL_FILLED
            ? "partialFilled"
            : "pending",
});

/** Echo immutable API attributes; only the UP price and quantity are changed. */
export const binaryOrderEditPayload = (
  order: PredictionOpenOrder,
  price: number,
  quantity: number,
  quoteTick: number,
  baseTick: number,
) => {
  if (!order.symbol || !order.orderType) return undefined;
  return {
    order_id: order.id,
    symbol: order.symbol,
    side: order.side === "buy" ? OrderSide.BUY : OrderSide.SELL,
    order_type: order.orderType,
    ...(order.reduceOnly !== undefined && { reduce_only: order.reduceOnly }),
    ...(order.clientOrderId !== undefined && {
      client_order_id: order.clientOrderId,
    }),
    ...(order.orderTag !== undefined && { order_tag: order.orderTag }),
    order_price: new Decimal(price).toFixed(
      new Decimal(quoteTick).decimalPlaces(),
    ),
    order_quantity: new Decimal(quantity).toFixed(
      new Decimal(baseTick).decimalPlaces(),
    ),
  };
};

/** Prices stay in UP coordinates in the model, including when editing. */
export const binaryOrderDisplayPrice = (
  order: PredictionOpenOrder,
  upPrice: number,
) =>
  order.outcome === "up" ? upPrice : new Decimal(1).sub(upPrice).toNumber();

export const binaryOrderExecutedValue = (order: PredictionOpenOrder) => {
  if (order.filledQuantity <= 0) return 0;
  if (order.averagePrice == null) return undefined;
  return new Decimal(order.filledQuantity)
    .mul(binaryOrderDisplayPrice(order, order.averagePrice))
    .toNumber();
};
