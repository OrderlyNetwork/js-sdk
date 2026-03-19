import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

/**
 * @formulaId maxQtyIsolated
 * @name Maximum Tradeable Quantity for Isolated Margin
 * @formula max_notional = min((1 / leverage / imr_factor)^(5/4), symbol_max_notional)
 * @description
 *
 * ## Definition
 *
 * **maxQtyIsolated**: Maximum tradeable quantity for isolated margin positions
 *
 * This function calculates the maximum quantity that can be traded for an isolated margin position,
 * considering available balance, leverage, position limits, and pending orders.
 *
 * ## Business Rules
 *
 * ### For BUY Orders:
 * - If `reduce_only == False` and `position_qty >= 0` (long or no position): Use simplified formula
 * - If `reduce_only == False` and `position_qty < 0` (short position): Use binary search iteration
 * - If `reduce_only == True`: Return `MAX(0, -position_qty)` (can only reduce short position)
 *
 * ### For SELL Orders:
 * - If `reduce_only == False` and `position_qty <= 0` (short or no position): Use simplified formula
 * - If `reduce_only == False` and `position_qty > 0` (long position): Use binary search iteration
 * - If `reduce_only == True`: Return `MAX(0, position_qty)` (can only reduce long position)
 *
 * ### Binary Search Algorithm:
 * - Used for reverse position scenarios (e.g., buying when holding short position)
 * - Maximum 30 iterations
 * - Searches for maximum quantity that satisfies: `iso_order_frozen <= available_balance` and `open_notional <= max_notional`
 *
 * ## Example
 *
 * ```
 * order_side = BUY
 * reduce_only = False
 * position_qty = 5 (long)
 * available_balance = 1000 USDC
 * leverage = 25
 * mark_price = 100000 USDC
 * current_order_reference_price = 99900 USDC
 * max_notional = 10059467.44 USDC
 * pending_long_notional = 299200 USDC
 * max_qty = MIN(1000 / 99900 * 25, (10059467.44 - 100000 * 5 - 299200) / 99900) = 0.25 BTC
 * ```
 *
 * @param inputs Input parameters for calculating maximum tradeable quantity
 * @returns Maximum tradeable quantity
 */
export function maxQtyForIsolatedMargin(inputs: {
  /**
   * @description Trading symbol
   */
  symbol: string;
  /**
   * @description Order side (BUY or SELL)
   */
  orderSide: OrderSide;
  /**
   * @description Current order reference price
   */
  currentOrderReferencePrice: number;
  /**
   * @description Available balance (USDC)
   */
  availableBalance: number;
  /**
   * @description Leverage for the trading pair
   */
  leverage: number;
  /**
   * @description Base initial margin rate
   */
  baseIMR: number;
  /**
   * @description IMR calculation factor
   */
  IMR_Factor: number;
  /**
   * @description Mark price
   */
  markPrice: number;
  /**
   * @description Current position quantity (positive for long, negative for short)
   */
  positionQty: number;
  /**
   * @description Pending long orders (excluding current order)
   */
  pendingLongOrders: Array<{ referencePrice: number; quantity: number }>;
  /**
   * @description Pending sell orders (excluding current order)
   */
  pendingSellOrders: Array<{ referencePrice: number; quantity: number }>;
  /**
   * @description Already frozen margin for long orders
   */
  isoOrderFrozenLong: number;
  /**
   * @description Already frozen margin for short orders
   */
  isoOrderFrozenShort: number;
  /**
   * @description Maximum notional value for the symbol
   */
  symbolMaxNotional: number;
  /**
   * @description Precision threshold for binary search (default: 1)
   */
  epsilon?: number;
}): number {
  const {
    orderSide,
    currentOrderReferencePrice,
    availableBalance,
    leverage,
    IMR_Factor,
    markPrice,
    positionQty,
    pendingLongOrders,
    pendingSellOrders,
    symbolMaxNotional,
    epsilon = 1,
  } = inputs;

  // Calculate max_notional
  const maxNotional = Math.min(
    new Decimal(1)
      .div(new Decimal(leverage).mul(IMR_Factor))
      .pow(5 / 4)
      .toNumber(),
    symbolMaxNotional,
  );

  // Handle BUY orders
  if (orderSide === OrderSide.BUY) {
    if (positionQty >= 0) {
      // Long position or no position - use simplified formula
      const pendingLongNotional = pendingLongOrders.reduce(
        (acc, order) =>
          acc +
          new Decimal(order.referencePrice).mul(order.quantity).toNumber(),
        0,
      );
      const maxQtyByBalance = new Decimal(availableBalance)
        .div(currentOrderReferencePrice)
        .mul(leverage)
        .toNumber();
      const maxQtyByNotional = new Decimal(maxNotional)
        .sub(new Decimal(markPrice).mul(positionQty))
        .sub(pendingLongNotional)
        .div(currentOrderReferencePrice)
        .toNumber();
      return Math.max(0, Math.min(maxQtyByBalance, maxQtyByNotional));
    } else {
      // Short position - use binary search
      return maxQtyIsolatedBinarySearch(
        {
          currentOrderReferencePrice,
          availableBalance,
          leverage,
          baseIMR: inputs.baseIMR,
          IMR_Factor,
          positionQty,
          pendingLongOrders,
          pendingSellOrders,
          isoOrderFrozenLong: inputs.isoOrderFrozenLong,
          isoOrderFrozenShort: inputs.isoOrderFrozenShort,
        },
        maxNotional,
        epsilon,
        OrderSide.BUY,
      );
    }
  } else {
    // SELL orders
    if (positionQty <= 0) {
      // Short position or no position - use simplified formula
      const pendingSellNotional = pendingSellOrders.reduce(
        (acc, order) =>
          acc +
          new Decimal(order.referencePrice).mul(order.quantity).toNumber(),
        0,
      );
      const maxQtyByBalance = new Decimal(availableBalance)
        .div(currentOrderReferencePrice)
        .mul(leverage)
        .toNumber();
      // Use abs(position_qty) for short positions
      const maxQtyByNotional = new Decimal(maxNotional)
        .sub(new Decimal(markPrice).mul(Math.abs(positionQty)))
        .sub(pendingSellNotional)
        .div(currentOrderReferencePrice)
        .toNumber();
      return Math.max(0, Math.min(maxQtyByBalance, maxQtyByNotional));
    } else {
      // Long position - use binary search
      return maxQtyIsolatedBinarySearch(
        {
          currentOrderReferencePrice,
          availableBalance,
          leverage,
          baseIMR: inputs.baseIMR,
          IMR_Factor,
          positionQty,
          pendingLongOrders,
          pendingSellOrders,
          isoOrderFrozenLong: inputs.isoOrderFrozenLong,
          isoOrderFrozenShort: inputs.isoOrderFrozenShort,
        },
        maxNotional,
        epsilon,
        OrderSide.SELL,
      );
    }
  }
}

/**
 * Binary search algorithm for calculating maxQtyIsolated in reverse position scenarios
 * @param inputs Input parameters
 * @param maxNotional Maximum notional value
 * @param epsilon Precision threshold
 * @param orderSide Order side (BUY or SELL)
 * @returns Maximum tradeable quantity
 */
function maxQtyIsolatedBinarySearch(
  inputs: {
    currentOrderReferencePrice: number;
    availableBalance: number;
    leverage: number;
    baseIMR: number;
    IMR_Factor: number;
    positionQty: number;
    pendingLongOrders: Array<{ referencePrice: number; quantity: number }>;
    pendingSellOrders: Array<{ referencePrice: number; quantity: number }>;
    isoOrderFrozenLong: number;
    isoOrderFrozenShort: number;
  },
  maxNotional: number,
  epsilon: number,
  orderSide: OrderSide,
): number {
  const {
    currentOrderReferencePrice,
    availableBalance,
    leverage,
    positionQty,
    pendingLongOrders,
    pendingSellOrders,
    isoOrderFrozenLong,
    isoOrderFrozenShort,
  } = inputs;
  // baseIMR and IMR_Factor are kept in the interface for future use but not currently used in binary search
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _baseIMR = inputs.baseIMR;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _IMR_Factor = inputs.IMR_Factor;

  // Calculate sum of pending orders quantity
  const pendingOrdersQty =
    orderSide === OrderSide.BUY
      ? pendingLongOrders.reduce((acc, order) => acc + order.quantity, 0)
      : pendingSellOrders.reduce((acc, order) => acc + order.quantity, 0);

  // Initialize search interval
  let left = Math.max(0, Math.max(0, Math.abs(positionQty)) - pendingOrdersQty);
  let right = new Decimal(maxNotional)
    .div(currentOrderReferencePrice)
    .add(Math.abs(positionQty))
    .toNumber();

  // Binary search (max 30 iterations)
  for (let i = 0; i < 30; i++) {
    const mid = (left + right) / 2;

    // Calculate order notional and frozen margin for current mid quantity
    const orderNotional = new Decimal(mid).mul(currentOrderReferencePrice);
    const orderMargin = orderNotional.div(leverage);

    // Calculate total frozen margin
    const totalFrozenMargin =
      orderSide === OrderSide.BUY
        ? isoOrderFrozenLong + orderMargin.toNumber()
        : isoOrderFrozenShort + orderMargin.toNumber();

    // Calculate open notional after order execution
    const newPositionQty =
      orderSide === OrderSide.BUY ? positionQty + mid : positionQty - mid;
    const openNotional = new Decimal(Math.abs(newPositionQty)).mul(
      currentOrderReferencePrice,
    );

    // Check conditions
    const frozenOk = totalFrozenMargin <= availableBalance;
    const notionalOk = openNotional.lte(maxNotional);

    if (frozenOk && notionalOk) {
      left = mid;
      // Early termination if precision is reached
      if (new Decimal(availableBalance).sub(totalFrozenMargin).lte(epsilon)) {
        break;
      }
    } else {
      right = mid;
    }
  }

  return Math.max(0, left);
}
