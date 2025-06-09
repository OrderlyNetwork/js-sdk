import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";

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

export type LiqPriceInputs = {
  markPrice: number;
  totalCollateral: number;
  positionQty: number;
  positions: Pick<API.PositionExt, "position_qty" | "mark_price" | "mmr">[];
  MMR: number;
};

/**
 * Calculates the liquidation price of a single position.
 * @param inputs The inputs for calculating the liquidation price.
 * @returns The liquidation price of the position.
 */
export function liqPrice(inputs: LiqPriceInputs): number | null {
  const { markPrice, totalCollateral, positions, positionQty, MMR } = inputs;

  // console.log("inputs", inputs);

  if (positionQty === 0 || totalCollateral === 0) {
    return null;
  }

  // totalNotional of all poisitions
  const totalNotional = positions.reduce<Decimal>((acc, cur) => {
    return acc.add(
      new Decimal(notional(cur.position_qty, cur.mark_price)).mul(cur.mmr),
    );
  }, zero);

  return Math.max(
    new Decimal(markPrice)
      .add(
        new Decimal(totalCollateral)
          .sub(totalNotional)
          .div(new Decimal(positionQty).abs().mul(MMR).sub(positionQty)),
      )
      .toNumber(),
    0,
  );
}

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
 */
export function estPriceForTP(inputs: {
  positionQty: number;
  entryPrice: number;
  pnl: number;
}): number {
  return new Decimal(inputs.pnl)
    .add(inputs.entryPrice)
    .div(inputs.positionQty)
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
