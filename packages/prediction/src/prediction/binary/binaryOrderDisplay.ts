import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionOrderSide,
  PredictionOutcome,
  PredictionOrderType,
} from "../prediction.types";
import { binaryRoundFromSymbol, isBinarySymbol } from "./binaryInfo";
import { complementPrice, binaryOrderOutcome } from "./binaryOrderRules";
import { matchesPredictionUnderlying } from "./productScope";

export { binaryOrderOutcome } from "./binaryOrderRules";

type PredictionStatus =
  | "pending"
  | "filled"
  | "partialFilled"
  | "cancelled"
  | "rejected";
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

export const binaryOrderDisplayType = (
  order: Pick<API.Order, "type">,
): PredictionOrderType =>
  [OrderType.LIMIT, OrderType.POST_ONLY, OrderType.BID, OrderType.ASK].includes(
    order.type as OrderType,
  )
    ? "limit"
    : "market";

export const binaryOrderRound = (
  order: Pick<API.Order, "symbol" | "created_time">,
) => binaryRoundFromSymbol(order.symbol, order.created_time) ?? 0;

/** Interpret status only at display boundaries; keep the API record unchanged. */
export const binaryOrderDisplayStatus = (
  order: Pick<API.Order, "status">,
): PredictionStatus => statusByApiStatus.get(String(order.status)) ?? "pending";

/** User-facing action; API side stays in UP-book coordinates for requests. */
export const binaryOrderDisplaySide = (
  order: Pick<API.Order, "reduce_only">,
): PredictionOrderSide => (order.reduce_only ? "sell" : "buy");

/**
 * UI Buy/Sell filters use display-side semantics: Buy covers Buy UP and Buy
 * DOWN (non-reduce-only), Sell covers Sell UP and Sell DOWN (reduce-only).
 * /v1/orders has no reduce_only query param, so the server-side `side` filter
 * (UP-book coordinates) cannot express this — the rows must be filtered here.
 */
export const matchesBinaryDisplaySide = (
  order: Pick<API.Order, "reduce_only">,
  side?: OrderSide,
): boolean =>
  side !== OrderSide.BUY && side !== OrderSide.SELL
    ? true
    : binaryOrderDisplaySide(order).toUpperCase() === side;

/** Echo immutable API attributes; only the UP price and quantity are changed. */
export const binaryOrderEditPayload = (
  order: API.Order,
  price: number,
  quantity: number,
  quoteTick: number,
  baseTick: number,
) => {
  if (!order.symbol || !order.type) return undefined;
  return {
    order_id: order.order_id,
    symbol: order.symbol,
    side: order.side,
    order_type: order.type,
    ...(order.reduce_only !== undefined && { reduce_only: order.reduce_only }),
    ...(order.client_order_id && {
      client_order_id: order.client_order_id,
    }),
    ...(order.order_tag && { order_tag: order.order_tag }),
    order_price: new Decimal(price).toFixed(
      new Decimal(quoteTick).decimalPlaces(),
    ),
    order_quantity: new Decimal(quantity).toFixed(
      new Decimal(baseTick).decimalPlaces(),
    ),
  };
};

/** Prices stay in UP coordinates in the model, including when editing. */
export const binaryOrderDisplayPrice = (order: API.Order, upPrice: number) =>
  binaryOrderOutcome(order) === "up" ? upPrice : complementPrice(upPrice);

export const binaryOrderExecutedValue = (order: API.Order) => {
  const filled = order.total_executed_quantity ?? 0;
  if (filled <= 0) return 0;
  if (!Number.isFinite(filled)) return undefined;
  if (!Number.isFinite(order.average_executed_price)) return undefined;
  return new Decimal(filled)
    .mul(binaryOrderDisplayPrice(order, order.average_executed_price))
    .toNumber();
};

/** Filter product scope without copying records or dropping API fields. */
export const filterPredictionOrders = (
  orders: readonly API.Order[],
  underlyingSymbol?: string,
): API.Order[] =>
  orders.filter(
    (order) =>
      !order.algo_order_id &&
      isBinarySymbol(order.symbol) &&
      matchesPredictionUnderlying(order.symbol, underlyingSymbol),
  );
export const isPredictionTerminalOrder = (order: API.Order): boolean =>
  order.status === OrderStatus.FILLED ||
  order.status === OrderStatus.CANCELLED ||
  order.status === OrderStatus.REJECTED;

/** Open-order prices of one round, in the selected outcome's book coordinate. */
export const binaryPendingOrderPrices = (
  orders: readonly API.Order[],
  symbol: string | undefined,
  outcome: PredictionOutcome,
): number[] =>
  symbol
    ? orders
        .filter(
          (order) =>
            order.symbol === symbol &&
            !isPredictionTerminalOrder(order) &&
            order.price != null &&
            order.price > 0,
        )
        .map((order) =>
          outcome === "up" ? order.price! : complementPrice(order.price!),
        )
    : [];

/**
 * "Filled" means "has executions", not terminal FILLED: MARKET submits a
 * protected-price IOC whose unfilled remainder terminates the order as
 * CANCELLED, so filtering by status === "filled" would hide executed records.
 * One predicate for every surface (portfolio page, merged panel, prediction
 * panel); perps rows keep the stock server-side FILLED semantics.
 */
export const hasPredictionExecutions = (order: API.Order) =>
  isPredictionTerminalOrder(order) && (order.total_executed_quantity ?? 0) > 0;
