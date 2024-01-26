import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { notional } from "./positions";

/**
 * Maximum price when placing an order
 * @see https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Max-price
 */
export function maxPrice(markprice: number, range: number) {
  return markprice * (1 + range);
}

/**
 * Minimum price when placing an order
 * @see https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Min-price
 */
export function minPrice(markprice: number, range: number) {
  return markprice * (1 - range);
}

export type EstimatedLiquidationPriceInputs = {
  totalCollateral: number;
  markPrice: number;
  baseMMR: number;
  baseIMR: number;
  IMR_Factor: number;
  positions: Pick<
    API.PositionExt,
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
    IMR_Factor,
  } = inputs;
  // opened positions for the symbol
  let currentPosition:
    | Pick<API.PositionExt, "position_qty" | "mark_price" | "symbol" | "mmr">
    | undefined = undefined;

  let newTotalMM = zero;

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

  const newQty = new Decimal(newOrder.qty).add(
    currentPosition?.position_qty ?? 0
  );

  return Math.max(
    0,
    new Decimal(markPrice)
      .add(
        new Decimal(totalCollateral)
          .sub(newTotalMM)
          .div(newQty.abs().mul(newMMR).sub(newQty))
      )
      .toNumber()
  );
}

export type EstimatedLeverageInputs = {
  totalCollateral: number;
  positions: Pick<API.PositionExt, "position_qty" | "mark_price" | "symbol">[];
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
    acc = acc.add(
      new Decimal(new Decimal(cur.position_qty).mul(cur.mark_price).abs())
    );

    if (cur.symbol === newOrder.symbol) {
      hasPosition = true;
      acc = acc.add(new Decimal(newOrder.qty).mul(newOrder.price));
    }

    return acc;
  }, zero);

  if (!hasPosition) {
    sumPositionNotional = sumPositionNotional.add(
      new Decimal(newOrder.qty).mul(newOrder.price).abs()
    );
  }

  const totalMarginRatio = new Decimal(totalCollateral).div(
    sumPositionNotional
  );

  return new Decimal(1)
    .div(totalMarginRatio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN)
    .toNumber();
}
