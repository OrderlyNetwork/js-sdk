import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";
import { DMax } from "./utils";

const MaxIterates = 30;
const CONVERGENCE_THRESHOLD = 0.0001;

/**
 * Calculates the notional value of a single position.
 * @param qty The quantity of the position.
 * @param mark_price The price of the position.
 * @returns The notional value of the position.
 */
export function notional(qty: number, mark_price: number): number {
  return new Decimal(qty).mul(mark_price).abs().toNumber();
}

/**
 * Calculates the total notional value of all positions.
 * @param positions The array of positions.
 * @returns The total notional value of all positions.
 */
export function totalNotional(positions: API.Position[]): number {
  return positions.reduce((acc, cur) => {
    return acc + notional(cur.position_qty, cur.mark_price);
  }, 0);
}

export type UnrealPnLInputs = {
  markPrice: number;
  openPrice: number;
  qty: number;
};

/**
 * Calculates the unrealized profit or loss of a single position.
 * @param inputs The inputs for calculating the unrealized profit or loss.
 * @returns The unrealized profit or loss of the position.
 */
export function unrealizedPnL(inputs: UnrealPnLInputs): number {
  return new Decimal(inputs.qty)
    .mul(inputs.markPrice - inputs.openPrice)
    .toNumber();
}

export type UnrealPnLROIInputs = {
  positionQty: number;
  openPrice: number;
  IMR: number;
  unrealizedPnL: number;
};

/**
 * Calculates the return on investment (ROI) of a single position's unrealized profit or loss.
 * @param inputs The inputs for calculating the ROI.
 * @returns The ROI of the position's unrealized profit or loss.
 */
export function unrealizedPnLROI(inputs: UnrealPnLROIInputs): number {
  const { openPrice, IMR } = inputs;

  if (
    inputs.unrealizedPnL === 0 ||
    inputs.positionQty === 0 ||
    openPrice === 0 ||
    IMR === 0
  )
    return 0;

  return new Decimal(inputs.unrealizedPnL)
    .div(new Decimal(Math.abs(inputs.positionQty)).mul(openPrice).mul(IMR))
    .toNumber();
}

/**
 * Calculates the total unrealized profit or loss of all positions.
 * @param positions The array of positions.
 * @returns The total unrealized profit or loss of all positions.
 */
export function totalUnrealizedPnL(positions: API.Position[]): number {
  return positions.reduce((acc, cur) => {
    return (
      acc +
      unrealizedPnL({
        qty: cur.position_qty,
        openPrice: cur.average_open_price,
        markPrice: cur.mark_price,
      })
    );
  }, 0);
}

const mmForOtherSymbols = (
  positions: Pick<API.Position, "position_qty" | "mark_price" | "mmr">[],
) => {
  // sum_i ( abs(position_qty_i) * mark_price_i * mmr_i )
  return positions.reduce<Decimal>((acc, cur) => {
    return acc.add(
      new Decimal(cur.position_qty).abs().mul(cur.mark_price).mul(cur.mmr),
    );
  }, zero);
};

/**
 * Calculates the liquidation price based on the formula:
 * return max(mark_price + [total_collateral - abs(position_qty) * mark_price * mmr - mm_for_other_symbols] / [abs(position_qty) * mmr - position_qty], 0)
 *
 * Note: The condition check "if position_qty >= 0 AND abs(position_qty) * mmr - position_qty >= 0" from the formula
 * has been removed as it was causing issues with SHORT position calculations.
 */
const calculateLiqPrice = (
  // symbol: string,
  markPrice: number,
  positionQty: number,
  MMR: number,
  totalCollateral: number,
  positions: Pick<API.Position, "position_qty" | "mark_price" | "mmr">[],
): Decimal => {
  const decimalMarkPrice = new Decimal(markPrice);
  const absQty = new Decimal(positionQty).abs();
  const denominator = absQty.mul(MMR).sub(positionQty);

  const liqPrice = new Decimal(totalCollateral)
    .sub(absQty.mul(decimalMarkPrice).mul(MMR))
    .sub(mmForOtherSymbols(positions))
    .div(denominator)
    .add(decimalMarkPrice);

  return DMax(liqPrice, zero);
};

const compareCollateralWithMM = (
  // price: number,
  inputs: {
    totalCollateral: number;
    positionQty: number;
    markPrice: number;
    baseMMR: number;
    baseIMR: number;
    IMRFactor: number;
    // IMRFactorPower: number;
    positions: Pick<
      API.PositionExt,
      "position_qty" | "mark_price" | "mmr" | "symbol"
    >[];
  },
) => {
  return (price: Decimal) => {
    const {
      totalCollateral,
      positionQty,
      markPrice,
      baseMMR,
      baseIMR,
      IMRFactor,
      positions,
    } = inputs;
    const decimalPositionQty = new Decimal(positionQty);
    const collateral = new Decimal(totalCollateral)
      .sub(decimalPositionQty.mul(markPrice))
      .add(decimalPositionQty.mul(price));

    const mm = decimalPositionQty
      .abs()
      .mul(price)
      .mul(
        Math.max(
          baseMMR,
          new Decimal(baseMMR)
            .div(baseIMR)
            .mul(IMRFactor)
            .mul(decimalPositionQty.mul(price).abs().toPower(IMRFactorPower))
            .toNumber(),
        ),
      )
      .add(mmForOtherSymbols(positions));

    // console.log("*****", {
    //   collateral: collateral.toNumber(),
    //   mm: mm.toNumber(),
    // });

    return collateral.gte(mm);
  };
};

export const liqPrice = (inputs: {
  markPrice: number;
  symbol: string;
  totalCollateral: number;
  positionQty: number;
  positions: Pick<
    API.PositionExt,
    "position_qty" | "mark_price" | "mmr" | "symbol"
  >[];
  MMR: number;
  baseMMR: number;
  baseIMR: number;
  IMRFactor: number;
  costPosition: number;
}) => {
  const {
    positionQty,
    markPrice,
    totalCollateral,
    positions,
    MMR,
    baseMMR,
    baseIMR,
    IMRFactor,
    symbol,
  } = inputs;

  if (positionQty === 0 || totalCollateral === 0) {
    return null;
  }
  const isLONG = positionQty > 0;

  const otherPositions = positions.filter((item) => item.symbol !== symbol);

  if (isLONG) {
    let liqPriceLeft = calculateLiqPrice(
      markPrice,
      positionQty,
      baseMMR,
      totalCollateral,
      otherPositions,
    );
    let liqPriceRight = calculateLiqPrice(
      markPrice,
      positionQty,
      MMR,
      totalCollateral,
      otherPositions,
    );

    const compareCollateralWithMMFunc = compareCollateralWithMM({
      totalCollateral,
      positionQty,
      markPrice,
      baseIMR,
      baseMMR,
      IMRFactor,
      positions: otherPositions,
    });

    for (let i = 0; i < MaxIterates; i++) {
      if (liqPriceLeft.gte(liqPriceRight)) {
        return liqPriceRight.toNumber();
      }

      const mid = new Decimal(liqPriceLeft).add(liqPriceRight).div(2);

      if (compareCollateralWithMMFunc(mid)) {
        liqPriceRight = mid;
      } else {
        liqPriceLeft = mid;
      }

      if (
        liqPriceRight
          .sub(liqPriceLeft)
          .div(liqPriceLeft.add(liqPriceRight))
          .mul(2)
          .lte(CONVERGENCE_THRESHOLD)
      ) {
        break;
      }
    }
    return liqPriceRight.toNumber();
  } else {
    // const decimalBaseMMR = new Decimal(baseMMR);
    let liqPriceRight = calculateLiqPrice(
      markPrice,
      positionQty,
      MMR,
      totalCollateral,
      otherPositions,
    );

    let liqPriceLeft = calculateLiqPrice(
      markPrice,
      positionQty,
      Math.max(
        baseIMR,
        new Decimal(baseMMR)
          .div(baseIMR)
          .mul(IMRFactor)
          .mul(
            new Decimal(positionQty)
              .mul(liqPriceRight)
              .abs()
              .toPower(IMRFactorPower),
          )
          .toNumber(),
      ),
      totalCollateral,
      otherPositions,
    );

    const compareCollateralWithMMFunc = compareCollateralWithMM({
      totalCollateral,
      positionQty,
      markPrice,
      baseMMR,
      baseIMR,
      IMRFactor,
      positions: otherPositions,
    });

    for (let i = 0; i < MaxIterates; i++) {
      if (liqPriceLeft.gte(liqPriceRight)) {
        return liqPriceLeft.toNumber();
      }

      const mid = liqPriceLeft.add(liqPriceRight).div(2);

      if (compareCollateralWithMMFunc(mid)) {
        liqPriceLeft = mid;
      } else {
        liqPriceRight = mid;
      }

      if (
        liqPriceRight
          .sub(liqPriceLeft)
          .div(liqPriceLeft.add(liqPriceRight))
          .mul(2)
          .lte(CONVERGENCE_THRESHOLD)
      ) {
        break;
      }

      // return liqPriceLeft.toNumber();
    }

    return liqPriceLeft.toNumber();
  }
};

export type MMInputs = {
  positionQty: number;
  markPrice: number;
  MMR: number;
};

/**
 * Calculates the maintenance margin of a position.
 * @param inputs The inputs for calculating the maintenance margin.
 * @returns The maintenance margin of the position.
 */
export function maintenanceMargin(inputs: MMInputs) {
  const { positionQty, markPrice, MMR } = inputs;

  return new Decimal(positionQty).mul(markPrice).mul(MMR).abs().toNumber();
}

export type UnsettlementPnLInputs = {
  positionQty: number;
  markPrice: number;
  costPosition: number;
  sumUnitaryFunding: number;
  lastSumUnitaryFunding: number;
};

/**
 * Calculates the unrealized profit or loss of each position.
 * @param inputs The inputs for calculating the unrealized profit or loss.
 * @returns The unrealized profit or loss of each position.
 */
export function unsettlementPnL(inputs: UnsettlementPnLInputs): number {
  const {
    positionQty,
    markPrice,
    costPosition,
    sumUnitaryFunding,
    lastSumUnitaryFunding,
  } = inputs;

  const qty = new Decimal(positionQty);

  return qty
    .mul(markPrice)
    .sub(costPosition)
    .sub(qty.mul(new Decimal(sumUnitaryFunding).sub(lastSumUnitaryFunding)))
    .toNumber();
}

export type TotalUnsettlementPnLInputs = {
  positions: (API.Position & {
    sum_unitary_funding: number;
  })[];
  sumUnitaryFunding: number;
};

/**
 * Calculates the total unrealized profit or loss of all positions.
 * @param positions The array of positions.
 * @returns The total unrealized profit or loss of all positions.
 */
export function totalUnsettlementPnL(
  positions: (API.Position & { sum_unitary_funding: number })[],
): number {
  if (!Array.isArray(positions) || positions.length === 0) {
    return 0;
  }

  return positions.reduce((acc, cur) => {
    return (
      acc +
      unsettlementPnL({
        positionQty: cur.position_qty,
        markPrice: cur.mark_price,
        costPosition: cur.cost_position,
        sumUnitaryFunding: cur.sum_unitary_funding,
        lastSumUnitaryFunding: cur.last_sum_unitary_funding,
      })
    );
  }, 0);
}

export type MMRInputs = {
  baseMMR: number;
  baseIMR: number;
  IMRFactor: number;
  positionNotional: number;
  IMR_factor_power: number;
};

/**
 * Calculates the maintenance margin requirement (MMR) of a position.
 * @param inputs The inputs for calculating the MMR.
 * @returns The MMR of the position.
 */
export function MMR(inputs: MMRInputs): number {
  const {
    baseMMR,
    baseIMR,
    IMRFactor,
    positionNotional,
    IMR_factor_power = IMRFactorPower,
  } = inputs;
  return Math.max(
    baseMMR,
    new Decimal(baseMMR)
      .div(baseIMR)
      .mul(IMRFactor)
      .mul(Math.pow(Math.abs(positionNotional), IMR_factor_power))
      // .toPower(IMR_factor_power)
      .toNumber(),
  );
}

/**
 * Calculates the profit or loss for take profit.
 * @returns The profit or loss for take profit.
 */
export function estPnLForTP(inputs: {
  positionQty: number;
  entryPrice: number;
  price: number;
}): number {
  return new Decimal(inputs.positionQty)
    .mul(new Decimal(inputs.price).sub(inputs.entryPrice))
    .toNumber();
}

/**
 * Calculates the estimated price for take profit.
 * This is the inverse of estPnLForTP: given PnL, calculates the price.
 * Formula: price = PnL / positionQty + entryPrice
 */
export function estPriceForTP(inputs: {
  positionQty: number;
  entryPrice: number;
  pnl: number;
}): number {
  return new Decimal(inputs.pnl)
    .div(inputs.positionQty)
    .add(inputs.entryPrice)
    .toNumber();
}

/**
 * Calculates the estimated offset for take profit.
 */
export function estOffsetForTP(inputs: {
  price: number;
  entryPrice: number;
}): number {
  return new Decimal(inputs.price).div(inputs.entryPrice).toNumber();
}

/**
 * Calculates the estimated price from offset for take profit.
 */
export function estPriceFromOffsetForTP(inputs: {
  offset: number;
  entryPrice: number;
}): number {
  return new Decimal(inputs.offset).add(inputs.entryPrice).toNumber();
}

/**
 * Calculates the PnL for stop loss.
 */
export function estPnLForSL(inputs: {
  positionQty: number;
  entryPrice: number;
}): number {
  return 0;
}

/**
 * calculate the max position notional
 * max_notional = ( (1/ (leverage * imr_factor) ) ^ (1/0.8)
 */
export function maxPositionNotional(inputs: {
  /** symbol leverage */
  leverage: number;
  IMRFactor: number;
}) {
  const { leverage, IMRFactor } = inputs;
  return new Decimal(1)
    .div(new Decimal(leverage).mul(IMRFactor))
    .pow(1 / 0.8)
    .toNumber();
}

/**
 * symbol_leverage_max = 1 / ( imr_factor * notional ^ 0.8 )
 */
export function maxPositionLeverage(inputs: {
  IMRFactor: number;
  notional: number;
}) {
  const { IMRFactor, notional } = inputs;
  return new Decimal(1)
    .div(new Decimal(IMRFactor).mul(new Decimal(notional).pow(0.8)))
    .toNumber();
}
