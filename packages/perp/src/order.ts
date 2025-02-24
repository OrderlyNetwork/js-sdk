import { API as orderUtils } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { notional } from "./positions";

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
  side: "BUY" | "SELL"
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

/**
 * Estimated liquidation price
 * @param inputs
 * @returns
 */
export function estLiqPrice(inputs: EstimatedLiquidationPriceInputs): number {
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
                  currentPosition.mark_price
                )
              : zero
          )
          .abs()
      )
      .toPower(4 / 5)
      .toNumber()
  );

  // console.log("new MMR", newMMR, newTotalMM.toNumber());

  const newQty = new Decimal(newOrder.qty).add(
    currentPosition?.position_qty ?? 0
  );

  if (newQty.eq(0)) {
    return 0;
  }

  const price = new Decimal(basePrice)
    .add(
      new Decimal(totalCollateral)
        .sub(newTotalMM)
        .sub(orderFee)
        .div(newQty.abs().mul(newMMR).sub(newQty))
    )
    .toNumber();

  return Math.max(0, price);
}

export type EstimatedLeverageInputs = {
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
};

/**
 * Estimated leverage
 * @param inputs EstimtedLeverageInputs
 * @returns number
 */
export function estLeverage(inputs: EstimatedLeverageInputs): number | null {
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
      new Decimal(newOrder.qty).mul(newOrder.price).abs()
    );
  }

  if (sumPositionNotional.eq(zero)) {
    return null;
  }

  const totalMarginRatio = new Decimal(totalCollateral).div(
    sumPositionNotional
  );

  return new Decimal(1)
    .div(totalMarginRatio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)
    .toNumber();
}
