import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionOpenOrder,
  PredictionOutcome,
  PredictionTrade,
} from "../prediction.types";
import { binaryRoundFromSymbol, isBinarySymbol } from "./binaryInfo";
import { complementPrice } from "./binaryOrderRules";
import { matchesPredictionUnderlying } from "./productScope";

type PredictionStatus = NonNullable<PredictionOpenOrder["status"]>;
// Maps (not object literals) so lookups with unexpected keys can never hit
// inherited properties like "constructor" or "toString".
const statusByApiStatus = new Map<string, PredictionStatus>([
  [OrderStatus.INCOMPLETE, "pending"],
  [OrderStatus.NEW, "pending"],
  [OrderStatus.FILLED, "filled"],
  [OrderStatus.PARTIAL_FILLED, "partialFilled"],
  [OrderStatus.CANCELLED, "cancelled"],
  [OrderStatus.REJECTED, "rejected"],
]);
const apiStatusByPredictionStatus = new Map<PredictionStatus, OrderStatus>([
  ["pending", OrderStatus.INCOMPLETE],
  ["filled", OrderStatus.FILLED],
  ["partialFilled", OrderStatus.PARTIAL_FILLED],
  ["cancelled", OrderStatus.CANCELLED],
  ["rejected", OrderStatus.REJECTED],
]);
export const toPredictionStatus = (value: unknown): PredictionStatus | "all" =>
  statusByApiStatus.get(String(value)) ?? "all";
export const toOrderStatus = (value: unknown): OrderStatus | "all" =>
  apiStatusByPredictionStatus.get(String(value) as PredictionStatus) ?? "all";

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
  status: statusByApiStatus.get(String(order.status)) ?? "pending",
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
) => (order.outcome === "up" ? upPrice : complementPrice(upPrice));

export const binaryOrderExecutedValue = (order: PredictionOpenOrder) => {
  if (order.filledQuantity <= 0) return 0;
  if (order.averagePrice == null) return undefined;
  return new Decimal(order.filledQuantity)
    .mul(binaryOrderDisplayPrice(order, order.averagePrice))
    .toNumber();
};

/** Shared account/list projection. Product filtering also guards cross-product WS cache inserts. */
export const normalizePredictionOrders = (
  orders: readonly API.Order[],
  underlyingSymbol?: string,
): PredictionOpenOrder[] =>
  orders
    .filter(
      (order) =>
        !order.algo_order_id &&
        isBinarySymbol(order.symbol) &&
        matchesPredictionUnderlying(order.symbol, underlyingSymbol),
    )
    .map(toPredictionOrder);
export const isPredictionTerminalOrder = (
  order: PredictionOpenOrder,
): order is PredictionTrade =>
  order.status === "filled" ||
  order.status === "cancelled" ||
  order.status === "rejected";

/** Open-order prices of one round, in the selected outcome's book coordinate. */
export const binaryPendingOrderPrices = (
  orders: readonly PredictionOpenOrder[],
  symbol: string | undefined,
  outcome: PredictionOutcome,
): number[] =>
  symbol
    ? orders
        .filter(
          (order) =>
            order.symbol === symbol &&
            !isPredictionTerminalOrder(order) &&
            order.price > 0,
        )
        .map((order) =>
          outcome === "up" ? order.price : complementPrice(order.price),
        )
    : [];

/**
 * "Filled" means "has executions", not terminal FILLED: MARKET submits a
 * protected-price IOC whose unfilled remainder terminates the order as
 * CANCELLED, so filtering by status === "filled" would hide executed records.
 * One predicate for every surface (portfolio page, merged panel, prediction
 * panel); perps rows keep the stock server-side FILLED semantics.
 */
export const hasPredictionExecutions = (order: PredictionOpenOrder) =>
  isPredictionTerminalOrder(order) && (order.filledQuantity ?? 0) > 0;
