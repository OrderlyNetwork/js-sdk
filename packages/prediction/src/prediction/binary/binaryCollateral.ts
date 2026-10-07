import { account } from "@orderly.network/perp";
import {
  MarginMode,
  OrderSide,
  OrderStatus,
  type API,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export const ISO_ORDER_FROZEN_BUFFER = 0.0006;
const MAX_QTY_SAFETY_FACTOR = 0.995;
const MAX_SEARCH_ITERATIONS = 20;

export type BinaryFundingEstimateMode =
  | "detailed"
  | "approximate"
  | "unavailable";
export type BinaryCollateralSnapshot = {
  positionQty: number;
  pendingBuyQty: number;
  pendingSellQty: number;
  /** PERP-compatible funding inputs exclude reduce-only orders. */
  orders: account.IsolatedPendingOrder[];
  /** Explicit RO exits reserve every closing-side order, including RO. */
  reservations: Array<{ orderId: number; side: OrderSide; quantity: number }>;
  mode: Exclude<BinaryFundingEstimateMode, "unavailable">;
};

const isPrice = (price: number) =>
  Number.isFinite(price) && price > 0 && price < 1;
const isQuantity = (quantity: number) =>
  Number.isFinite(quantity) && quantity >= 0;
const floorQuantity = (quantity: Decimal, tick: number) =>
  quantity.div(tick).toDecimalPlaces(0, Decimal.ROUND_FLOOR).mul(tick);

/**
 * Prefer per-order inputs covering the position aggregates. Otherwise use
 * aggregate quantities at UP Mark, like PERP. A fallback is an estimate,
 * not an upper bound on backend frozen margin or a ReduceOnlyBo simulation.
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
    if (side === OrderSide.BUY) streamBuyQty = streamBuyQty.add(remaining);
    else streamSellQty = streamSellQty.add(remaining);
    const price = Number(order.price);
    if (
      order.margin_mode !== MarginMode.ISOLATED ||
      !isPrice(price) ||
      !Number.isFinite(order.created_time)
    ) {
      valid = false;
      continue;
    }
    if (order.reduce_only) continue;
    pending.push({
      side,
      referencePrice: price,
      quantity: remaining.toNumber(),
      createdTime: order.created_time,
    });
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
  if ((buyQty > 0 || sellQty > 0) && !isPrice(markPrice ?? NaN))
    return undefined;
  const aggregate: account.IsolatedPendingOrder[] = [];
  if (buyQty > 0)
    aggregate.push({
      side: OrderSide.BUY,
      referencePrice: markPrice!,
      quantity: buyQty,
    });
  if (sellQty > 0)
    aggregate.push({
      side: OrderSide.SELL,
      referencePrice: markPrice!,
      quantity: sellQty,
    });
  return { ...snapshot, orders: aggregate, mode: "approximate" };
}

const binaryMarginPrice = (order: account.IsolatedPendingOrder) =>
  order.side === OrderSide.BUY
    ? order.referencePrice
    : new Decimal(1).sub(order.referencePrice).toNumber();

/** Incremental opening risk; price priority always stays in UP coordinates. */
export function estimateBinaryOrderFrozen(
  snapshot: BinaryCollateralSnapshot | undefined,
  side: OrderSide,
  upPrice: number,
  quantity: number,
): Decimal | undefined {
  if (!snapshot || !isPrice(upPrice) || !isQuantity(quantity)) return undefined;
  return account.additionalIsolatedOrderFrozenByOrders({
    positionQty: snapshot.positionQty,
    pendingOrders: snapshot.orders,
    newOrders: [
      {
        side,
        referencePrice: upPrice,
        quantity,
        createdTime: Number.MAX_SAFE_INTEGER,
      },
    ],
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
 * Bounded Max estimate. Preserve the funding model's pure closing budget and
 * apply PERP's safety factor only to extra opening size, then floor to tick.
 * This does not model backend RO resizing or seek the last affordable tick.
 */
export function maxBinaryOrderQuantity(inputs: {
  snapshot: BinaryCollateralSnapshot | undefined;
  side: OrderSide;
  upPrice: number;
  balance: number;
  baseTick?: number;
  baseMax?: number;
}): number {
  const {
    snapshot,
    side,
    upPrice,
    balance,
    baseTick = 0.01,
    baseMax = 10000,
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
  const upper = floorQuantity(new Decimal(baseMax), baseTick);
  const closeMax = closing.lt(upper) ? closing : upper;
  let left = closeMax;
  let right = upper;
  if (
    estimateBinaryOrderFrozen(snapshot, side, upPrice, right.toNumber())!.lte(
      balance,
    )
  )
    left = right;
  else {
    for (let i = 0; i < MAX_SEARCH_ITERATIONS; i++) {
      const mid = left.add(right).div(2);
      if (
        estimateBinaryOrderFrozen(snapshot, side, upPrice, mid.toNumber())!.lte(
          balance,
        )
      )
        left = mid;
      else right = mid;
    }
  }
  return floorQuantity(
    closeMax.add(left.sub(closeMax).mul(MAX_QTY_SAFETY_FACTOR)),
    baseTick,
  ).toNumber();
}
