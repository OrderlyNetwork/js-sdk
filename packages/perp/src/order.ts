import { OrderSide, API as orderUtils } from "@orderly.network/types";
import { Decimal, getTPSLDirection, zero } from "@orderly.network/utils";

// ============ Backward Compatibility Types ============
/** @deprecated Use inline type or the new input type instead */
export type EstimatedLiquidationPriceInputs = {
  totalCollateral: number;
  markPrice: number;
  baseMMR: number;
  baseIMR: number;
  IMR_Factor: number;
  orderFee: number;
  positions: Pick<
    orderUtils.PositionExt,
    "position_qty" | "mark_price" | "symbol" | "mmr"
  >[];
  newOrder: {
    symbol: string;
    qty: number;
    price: number;
  };
};

/** @deprecated Use inline type or the new input type instead */
export type EstimatedLeverageInputs = {
  totalCollateral: number;
  positions: Pick<
    orderUtils.PositionExt,
    "position_qty" | "mark_price" | "symbol" | "mmr"
  >[];
  newOrder: {
    symbol: string;
    qty: number;
    price: number;
  };
};
// ====================================================

/**
 * Maximum price when placing an order
 */
export function maxPrice(markprice: number, range: number) {
  return markprice * (1 + range);
}

/**
 * Minimum price when placing an order
 */
export function minPrice(markprice: number, range: number) {
  return markprice * (1 - range);
}

/**
 * Scope price when placing an order
 * @returns number
 */
export function scopePrice(
  price: number,
  scope: number,
  side: "BUY" | "SELL",
): number {
  if (side === "BUY") {
    return price * (1 - scope);
  }
  return price * (1 + scope);
}

/**
 * Calculate the order fee
 */
export function orderFee(inputs: {
  /**
   * Order quantity
   */
  qty: number;
  price: number;
  futuresTakeFeeRate: number;
}): number {
  return new Decimal(inputs.qty)
    .mul(inputs.price)
    .mul(inputs.futuresTakeFeeRate)
    .toNumber();
}

/**
 * @formulaId estLiqPrice
 * @name Est. Position liq. Price
 * @description
 *
 * ## When user has positions:
 *
 * ```
 * Est. liq. Position Price = max(mark_price_i + (total_collateral_value - new_total_MM - order_fee) / (abs(position_qty_i + new_order_qty_i) * new_MMRi - (position_qty_i + new_order_qty_i)), 0)
 * ```
 *
 * ## When user has no positions:
 *
 * ```
 * Est. liq. Position Price = max(order_price_i + (total_collateral_value - new_total_MM - order_fee) / (abs(position_qty_i + new_order_qty_i) * new_MMRi - (position_qty_i + new_order_qty_i)), 0)
 * ```
 *
 * ## Formula Components:
 *
 * - `order_fee = new_order_qty_i * order_price_i * futures_take_fee_rate`
 * - `new_total_MM = sum(abs(position_qty_i * mark_price_i + new_order_qty_i * order_price_i)) * MMRi)`
 * - `new_MMRi = Max(Base_MMR_i, (Base_MMR_i / Base_IMR_i) * IMR_Factor_i * Abs(position_qty_i * mark_price_i + new_order_qty_i * limit_price_i)^(4/5))`
 *
 * ## Order Price Determination:
 *
 * ### Market Order:
 * - **Long order**: `order_price_i = ask0`
 * - **Short order**: `order_price_i = bid0`
 *
 * ### Limit Order:
 *
 * #### Long order:
 * - If `limit_price >= ask0`: `order_price_i = ask0`
 * - If `limit_price < ask0`: `order_price_i = limit_price`
 *
 * #### Short order:
 * - If `limit_price <= bid0`: `order_price_i = bid0`
 * - If `limit_price > bid0`: `order_price_i = limit_price`
 *
 * ## Parameter Definitions:
 *
 * | Parameter | Description |
 * |-----------|-------------|
 * | `Est. Position liq. Price` | Estimated liquidation price for the position |
 * | `position_qty_i` | Position quantity for a single symbol |
 * | `mark_price_i` | Mark price for a single symbol |
 * | `total_collateral_value` | Total asset value of user's account margin (USDC denominated) |
 * | `new_order_qty_i` | Symbol quantity when user prepares to open position (positive for long, negative for short) |
 * | `new_total_MM` | Sum of current position maintenance margin (including prepared order maintenance margin) |
 * | `new_MMR_i` | Maintenance margin rate for a single symbol (including prepared order notional consideration) |
 * | `Base_MMR_i` | Base maintenance margin rate for a single symbol |
 * | `Base_IMR_i` | Base initial margin rate for a single symbol |
 * | `IMR_Factor_i` | IMR calculation factor for a single symbol, from v1/client/info |
 * | `Position_Notional_i` | Sum of position notional for a single symbol |
 * | `order_fee` | Estimated order fee when user prepares to open position |
 * | `futures_take_fee_rate` | User's futures take fee rate, from GET /v1/client/info |
 * | `order_price_i` | Estimated execution price when user prepares to open position |
 * | `limit_price` | Price entered by user when preparing to open position |
 * | `ask0` | Minimum ask price from orderbook |
 * | `bid0` | Maximum bid price from orderbook |
 *
 * ## Examples:
 *
 * ### Market Order Example:
 * Long BTC qty = 0.1, mark price = 25986.2, ask0 = 26000, BTC position_qty_i = 0.2, ETH position_qty_i = -3
 * futures_take_fee_rate = 0.06%
 *
 * **Result**: BTC Est. Position liq. Price = 21268.7316
 *
 * ### Limit Order Example 1:
 * Long BTC qty = 0.1, mark price = 25986.2, ask0 = 26000, limit price = 25000, BTC position_qty_i = 0.2, ETH position_qty_i = -3
 *
 * **Result**: BTC Est. Position liq. Price = 21250.9772
 *
 * ### Limit Order Example 2:
 * Short BTC qty = -0.1, mark price = 25986.2, bid0 = 25900, limit price = 25000, BTC position_qty_i = 0.2, ETH position_qty_i = -3
 *
 * **Result**: BTC Est. Position liq. Price = 9102.17368
 *
 * ### No Position Example:
 * Long BTC qty = 0.1, mark price = 25986.2, ask0 = 26000, limit price = 25000
 *
 * **Result**: BTC Est. Position liq. Price = 5472
 *
 * @param inputs
 * @returns
 */
export function estLiqPrice(inputs: {
  totalCollateral: number;
  markPrice: number;
  baseMMR: number;
  baseIMR: number;
  IMR_Factor: number;
  orderFee: number;
  positions: {
    position_qty: number;
    mark_price: number;
    symbol: string;
    mmr: number;
  }[];
  newOrder: {
    symbol: string;
    qty: number;
    price: number;
  };
}): number {
  const {
    positions,
    newOrder,
    totalCollateral,
    markPrice,
    baseIMR,
    baseMMR,
    orderFee,
    IMR_Factor,
  } = inputs;
  // opened positions for the symbol
  let currentPosition:
    | Pick<
        orderUtils.PositionExt,
        "position_qty" | "mark_price" | "symbol" | "mmr"
      >
    | undefined = undefined;

  let newTotalMM = zero;

  const hasPosition =
    positions.filter((item) => item.position_qty > 0).length > 0;

  const basePrice = hasPosition ? markPrice : newOrder.price;

  const newOrderNotional = new Decimal(newOrder.qty).mul(newOrder.price);

  for (let index = 0; index < positions.length; index++) {
    const position = positions[index];
    let notional = new Decimal(position.position_qty).mul(position.mark_price);
    if (newOrder.symbol === position.symbol) {
      currentPosition = position;
      notional = notional.add(newOrderNotional);
    }

    newTotalMM = newTotalMM.add(notional.abs().mul(position.mmr));
  }

  // if no position
  if (!currentPosition) {
    newTotalMM = newTotalMM.add(newOrderNotional.mul(baseMMR));
  }

  const newMMR = Math.max(
    baseMMR,
    new Decimal(baseMMR)
      .div(baseIMR)
      .mul(IMR_Factor)
      .mul(
        newOrderNotional
          .add(
            !!currentPosition
              ? new Decimal(currentPosition.position_qty).mul(
                  currentPosition.mark_price,
                )
              : zero,
          )
          .abs(),
      )
      .toPower(4 / 5)
      .toNumber(),
  );

  // console.log("new MMR", newMMR, newTotalMM.toNumber());

  const newQty = new Decimal(newOrder.qty).add(
    currentPosition?.position_qty ?? 0,
  );

  if (newQty.eq(0)) {
    return 0;
  }

  const denominator = newQty.abs().mul(newMMR).sub(newQty);

  if (denominator.eq(zero)) {
    return 0;
  }

  const price = new Decimal(basePrice)
    .add(
      new Decimal(totalCollateral)
        .sub(newTotalMM)
        .sub(orderFee)
        .div(denominator),
    )
    .toNumber();

  return Math.max(0, price);
}

/**
 * Estimated leverage
 * @param inputs EstimtedLeverageInputs
 * @returns number
 */
export function estLeverage(inputs: {
  totalCollateral: number;
  positions: Pick<
    orderUtils.PositionExt,
    "position_qty" | "mark_price" | "symbol"
  >[];
  newOrder: {
    symbol: string;
    qty: number;
    price: number;
  };
}): number | null {
  const { totalCollateral, positions, newOrder } = inputs;
  if (totalCollateral <= 0) {
    return null;
  }
  let hasPosition = false;
  let sumPositionNotional = positions.reduce((acc, cur) => {
    let count = new Decimal(cur.position_qty).mul(cur.mark_price);
    // acc = acc.add(
    //   new Decimal(cur.position_qty).mul(cur.mark_price)
    //   // .abs()
    // );

    if (cur.symbol === newOrder.symbol) {
      hasPosition = true;
      // acc = acc.add(new Decimal(newOrder.qty).mul(newOrder.price));
      count = count.add(new Decimal(newOrder.qty).mul(newOrder.price));
    }

    return acc.add(count.abs());
  }, zero);

  if (!hasPosition) {
    sumPositionNotional = sumPositionNotional.add(
      new Decimal(newOrder.qty).mul(newOrder.price).abs(),
    );
  }

  if (sumPositionNotional.eq(zero)) {
    return null;
  }

  const totalMarginRatio = new Decimal(totalCollateral).div(
    sumPositionNotional,
  );

  return new Decimal(1)
    .div(totalMarginRatio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)
    .toNumber();
}

// ROI = (close price - order_price) / order_price × leverage × direction
// leverage = MIN( current_account_leverage, symbol_leverage)
export function tpslROI(inputs: {
  side: OrderSide;
  type: "tp" | "sl";
  closePrice: number;
  orderPrice: number;
  leverage: number;
}) {
  const direction = getTPSLDirection({
    side: inputs.side,
    type: inputs.type,
    closePrice: inputs.closePrice,
    orderPrice: inputs.orderPrice,
  });

  const { closePrice, orderPrice, leverage } = inputs;
  return new Decimal(closePrice)
    .minus(orderPrice)
    .div(orderPrice)
    .mul(leverage)
    .abs()
    .mul(direction)
    .toNumber();
}
