import { account } from "@orderly.network/perp";
import {
  MarginMode,
  OrderSide,
  OrderStatus,
  type API,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { floorToTickDecimal } from "../predictionShared";
import {
  complementPrice,
  DEFAULT_BINARY_BASE_MAX,
  DEFAULT_BINARY_BASE_TICK,
  splitBinaryQuantity,
} from "./binaryOrderRules";
import type { BinarySizeRules } from "./binaryOrderRules";

export const ISO_ORDER_FROZEN_BUFFER = 0.0006;

export type BinaryFundingEstimateMode =
  | "detailed"
  | "approximate"
  | "unavailable";
export type BinaryCollateralSnapshot = {
  positionQty: number;
  pendingBuyQty: number;
  pendingSellQty: number;
  /**
   * Per-order funding inputs, reduce-only included: RO orders freeze nothing
   * (binaryMarginPrice) but still offset the holding by allocation priority,
   * matching the risk engine's one-holding-one-offset netting (Risk §6.2).
   */
  orders: account.IsolatedPendingOrder[];
  /** Explicit RO exits reserve every closing-side order, including RO. */
  reservations: Array<{ orderId: number; side: OrderSide; quantity: number }>;
  mode: Exclude<BinaryFundingEstimateMode, "unavailable">;
};

const isPrice = (price: number) =>
  Number.isFinite(price) && price > 0 && price < 1;
const isQuantity = (quantity: number) =>
  Number.isFinite(quantity) && quantity >= 0;
const floorQuantity = floorToTickDecimal;

/**
 * Prefer per-order inputs covering the position aggregates. Otherwise keep
 * known order prices and timing and estimate the remainder at UP Mark.
 * A fallback is an estimate, not an upper bound on backend frozen margin or
 * a ReduceOnlyBo simulation.
 */
export function resolveBinaryCollateral(inputs: {
  symbol: string | undefined;
  positions: API.Position[] | undefined;
  orders: Array<API.Order | API.AlgoOrder> | null | undefined;
  ordersComplete: boolean;
  markPrice?: number;
}): BinaryCollateralSnapshot | undefined {
  const { symbol, positions, orders, ordersComplete } = inputs;
  if (!symbol || !Array.isArray(positions)) return undefined;
  const position = positions.find((row) => row.symbol === symbol);
  if (
    position?.margin_mode != null &&
    position.margin_mode !== MarginMode.ISOLATED
  )
    return undefined;
  const positionQty = position?.position_qty ?? 0;
  const pendingBuyQty = position?.pending_long_qty ?? 0;
  const pendingSellQty = position?.pending_short_qty ?? 0;
  if (
    !Number.isFinite(positionQty) ||
    !isQuantity(pendingBuyQty) ||
    !isQuantity(pendingSellQty)
  )
    return undefined;

  const uniqueOrders = new Map<number, API.Order>();
  for (const item of orders ?? []) {
    if (item.symbol !== symbol || item.algo_order_id) continue;
    const order = item as API.Order;
    if (
      [OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(
        order.status as OrderStatus,
      )
    )
      continue;
    const previous = uniqueOrders.get(order.order_id);
    if (!previous || order.updated_time > previous.updated_time)
      uniqueOrders.set(order.order_id, order);
  }

  let valid = true;
  let streamBuyQty = new Decimal(0);
  let streamSellQty = new Decimal(0);
  const pending: account.IsolatedPendingOrder[] = [];
  const observedOrders: account.IsolatedPendingOrder[] = [];
  const reservations: BinaryCollateralSnapshot["reservations"] = [];
  for (const order of [...uniqueOrders.values()].sort(
    (a, b) => a.order_id - b.order_id,
  )) {
    const quantity = Number(order.quantity);
    const filled = Number(order.total_executed_quantity ?? 0);
    const side = order.side as OrderSide;
    if (
      !Number.isFinite(order.order_id) ||
      ![OrderSide.BUY, OrderSide.SELL].includes(side) ||
      !isQuantity(quantity) ||
      !isQuantity(filled) ||
      filled > quantity
    ) {
      valid = false;
      continue;
    }
    if (order.margin_mode != null && order.margin_mode !== MarginMode.ISOLATED)
      return undefined;
    const remaining = new Decimal(quantity).sub(filled);
    if (remaining.lte(0)) continue;
    reservations.push({
      orderId: order.order_id,
      side,
      quantity: remaining.toNumber(),
    });
    if (side === OrderSide.BUY) {
      streamBuyQty = streamBuyQty.add(remaining);
    } else {
      streamSellQty = streamSellQty.add(remaining);
    }
    const price = Number(order.price);
    const pendingOrder: account.IsolatedPendingOrder = {
      side,
      referencePrice: price,
      quantity: remaining.toNumber(),
      createdTime: Number.isFinite(order.created_time)
        ? order.created_time
        : undefined,
      // RO freezes nothing but still participates in closing allocation.
      ...(order.reduce_only ? { reduceOnly: true } : {}),
    };
    observedOrders.push(pendingOrder);
    if (
      order.margin_mode !== MarginMode.ISOLATED ||
      !isPrice(price) ||
      !Number.isFinite(order.created_time)
    ) {
      valid = false;
      continue;
    }
    pending.push(pendingOrder);
  }

  const covered =
    streamBuyQty.add(1e-8).gte(pendingBuyQty) &&
    streamSellQty.add(1e-8).gte(pendingSellQty);
  // Do not lose known pending quantity when the order and position streams lag.
  // Use the larger observation, never add the two observations together.
  const buyQty = Math.max(pendingBuyQty, streamBuyQty.toNumber());
  const sellQty = Math.max(pendingSellQty, streamSellQty.toNumber());
  const snapshot = {
    positionQty,
    pendingBuyQty: buyQty,
    pendingSellQty: sellQty,
    reservations,
  };
  if (
    Array.isArray(orders) &&
    valid &&
    covered &&
    (ordersComplete || position !== undefined)
  ) {
    return { ...snapshot, orders: pending, mode: "detailed" };
  }

  const markPrice = isPrice(inputs.markPrice ?? NaN)
    ? inputs.markPrice!
    : position?.mark_price;
  // Mark is needed only for unknown opening prices or unobserved quantities.
  // Missing order metadata alone must not discard usable observed prices.
  const needsMarkPrice =
    new Decimal(buyQty).gt(streamBuyQty) ||
    new Decimal(sellQty).gt(streamSellQty) ||
    observedOrders.some(
      (order) => !order.reduceOnly && !isPrice(order.referencePrice),
    );
  if (needsMarkPrice && !isPrice(markPrice ?? NaN)) return undefined;
  const latestCreatedTime = observedOrders.reduce(
    (latest, order) => Math.max(latest, order.createdTime ?? 0),
    0,
  );
  // Preserve every observed price and timestamp: forcing RO ahead of an older
  // ordinary order can inflate frozenBefore and understate additional frozen.
  // Unknown timing is estimated at the latest known creation time; it does
  // not establish backend FIFO. Only quantities absent from the stream are
  // aggregated, after the observed orders on equal-price/time ties.
  const aggregate: account.IsolatedPendingOrder[] = observedOrders.map(
    (order) => ({
      ...order,
      referencePrice: isPrice(order.referencePrice)
        ? order.referencePrice
        : order.reduceOnly
          ? order.side === OrderSide.BUY
            ? 1
            : 0
          : markPrice!,
      createdTime: order.createdTime ?? latestCreatedTime,
    }),
  );
  // Unknown RO prices use allocation sentinels (BUY 1 / SELL 0), keeping
  // their closing claim ahead of new orders without freezing margin.
  const aggregateSide = (
    side: OrderSide,
    total: number,
    observedQty: Decimal,
  ) => {
    const remainder = new Decimal(total).sub(observedQty);
    if (remainder.gt(0)) {
      aggregate.push({
        side,
        referencePrice: markPrice!,
        quantity: remainder.toNumber(),
        createdTime: latestCreatedTime,
      });
    }
  };
  aggregateSide(OrderSide.BUY, buyQty, streamBuyQty);
  aggregateSide(OrderSide.SELL, sellQty, streamSellQty);
  return { ...snapshot, orders: aggregate, mode: "approximate" };
}

/**
 * Margin price of a pending order: BUY freezes p, SELL freezes 1-p; a
 * reduce-only order freezes nothing (PRD §7.2) yet still consumes closing
 * budget through its referencePrice priority.
 */
const binaryMarginPrice = (order: account.IsolatedPendingOrder) =>
  order.reduceOnly
    ? 0
    : order.side === OrderSide.BUY
      ? order.referencePrice
      : complementPrice(order.referencePrice);

/** Incremental opening risk; price priority always stays in UP coordinates. */
export function estimateBinaryOrderFrozen(
  snapshot: BinaryCollateralSnapshot | undefined,
  side: OrderSide,
  upPrice: number,
  quantity: number,
  quantities: number[] = [quantity],
): Decimal | undefined {
  if (!snapshot || !isPrice(upPrice) || !isQuantity(quantity)) return undefined;
  return account.additionalIsolatedOrderFrozenByOrders({
    positionQty: snapshot.positionQty,
    pendingOrders: snapshot.orders,
    newOrders: quantities.map((size, index) => ({
      side,
      referencePrice: upPrice,
      quantity: size,
      createdTime: Number.MAX_SAFE_INTEGER - quantities.length + index,
    })),
    leverage: 1,
    isoTakerFeeBuffer: ISO_ORDER_FROZEN_BUFFER,
    getMarginPrice: binaryMarginPrice,
  });
}

/** Remaining shares for an explicit RO exit, reserving all closing-side orders. */
export function availableBinaryCloseQuantity(
  snapshot: BinaryCollateralSnapshot | undefined,
  side: OrderSide,
  excludeOrderId?: number,
): number {
  if (
    !snapshot ||
    (side === OrderSide.SELL
      ? snapshot.positionQty <= 0
      : snapshot.positionQty >= 0)
  )
    return 0;
  const total =
    side === OrderSide.BUY ? snapshot.pendingBuyQty : snapshot.pendingSellQty;
  const excluded = snapshot.reservations.find(
    (order) => order.orderId === excludeOrderId && order.side === side,
  );
  const reserved = new Decimal(total).sub(excluded?.quantity ?? 0);
  const available = new Decimal(snapshot.positionQty)
    .abs()
    .sub(reserved.gt(0) ? reserved : 0);
  return available.gt(0) ? available.toNumber() : 0;
}

/**
 * Find the last affordable integer tick, retaining the pure closing budget.
 * Split sizing accounts for each child's rounding and shared closing capacity.
 */
export function maxBinaryOrderQuantity(inputs: {
  snapshot: BinaryCollateralSnapshot | undefined;
  side: OrderSide;
  upPrice: number;
  balance: number;
  baseTick?: number;
  baseMax?: number;
  splitRules?: BinarySizeRules;
}): number {
  const {
    snapshot,
    side,
    upPrice,
    balance,
    baseTick = DEFAULT_BINARY_BASE_TICK,
    baseMax = DEFAULT_BINARY_BASE_MAX,
    splitRules,
  } = inputs;
  if (
    !snapshot ||
    !isPrice(upPrice) ||
    !isQuantity(balance) ||
    !Number.isFinite(baseTick) ||
    baseTick <= 0 ||
    !isQuantity(baseMax)
  )
    return 0;
  const reverse =
    (side === OrderSide.BUY && snapshot.positionQty < 0) ||
    (side === OrderSide.SELL && snapshot.positionQty > 0);
  const pendingQty = snapshot.orders
    .filter((order) => order.side === side)
    .reduce((sum, order) => sum.add(order.quantity), new Decimal(0));
  const unreserved = new Decimal(snapshot.positionQty).abs().sub(pendingQty);
  const closing =
    reverse && unreserved.gt(0)
      ? floorQuantity(unreserved, baseTick)
      : new Decimal(0);
  const marginPrice =
    side === OrderSide.BUY ? upPrice : complementPrice(upPrice);
  const fundedUpper = new Decimal(balance)
    .div(
      new Decimal(marginPrice).mul(new Decimal(1).add(ISO_ORDER_FROZEN_BUFFER)),
    )
    .add(new Decimal(snapshot.positionQty).abs())
    .add(pendingQty);
  const upper = floorQuantity(
    splitRules ? fundedUpper : new Decimal(baseMax),
    baseTick,
  );
  const closeMax = closing.lt(upper) ? closing : upper;
  const affordable = (ticks: Decimal) => {
    const quantity = ticks.mul(baseTick).toNumber();
    const quantities = splitRules
      ? splitBinaryQuantity(quantity, upPrice, {
          ...splitRules,
          min_notional: 0,
          base_min: baseTick,
        })
      : [quantity];
    return (
      quantities != null &&
      estimateBinaryOrderFrozen(
        snapshot,
        side,
        upPrice,
        quantity,
        quantities,
      )!.lte(balance)
    );
  };
  let left = closeMax.div(baseTick);
  let right = upper.div(baseTick);
  while (left.lt(right)) {
    const mid = left
      .add(right)
      .add(1)
      .div(2)
      .toDecimalPlaces(0, Decimal.ROUND_FLOOR);
    if (affordable(mid)) left = mid;
    else right = mid.sub(1);
  }
  return left.mul(baseTick).toNumber();
}
