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
 * @formulaId totalNotional
 * @name Total Notional
 * @formula Total Notional = sum ( abs(position_qty_i * mark_price_i) )
 * @description
 * ## Term Definitions
 *
 * - **Total Notional**: Sum of current position notional values
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 *
 * ## Example
 *
 * **Total Notional** = 10112.43
 *
 * **abs(BTC position notional)** = 5197.2
 *
 * **abs(ETH position notional)** = 4915.23
 *
 * @param positions The array of positions.
 * @returns The total notional value of all positions.
 */
export function totalNotional(positions: API.Position[]): number {
  return positions.reduce((acc, cur) => {
    return acc + notional(cur.position_qty, cur.mark_price);
  }, 0);
}

export type UnrealPnLInputs = {
  /** symbol mark price */
  markPrice: number;
  /** symbol open price */
  openPrice: number;
  /** symbol quantity */
  qty: number;
};

/**
 * @formulaId unrealizedPnL
 * @description Calculates the unrealized profit or loss of a single position.
 * @formula qty * (markPrice - openPrice)
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
 * @formulaId unrealizedPnLROI
 * @name Position unrealized ROI
 * @formula Position unrealized ROI = Position unrealized PNL / ( IMR_i *  abs(position_qty_i * entry_price_i) ) * 100%, IMR_i = Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i)^(4/5))
 * @description
 * ## Term Definitions
 *
 * - **Position unrealized ROI**: Single symbol unrealized return on investment
 * - **Position unrealized PNL**: Single symbol unrealized profit and loss
 * - **IMR_i**: Single symbol initial margin rate
 * - **Max Account Leverage**: User's current maximum account leverage setting
 * - **Base IMR_i**: Single symbol base initial margin rate
 * - **IMR Factor_i**: Single symbol IMR calculation factor, from v1/client/info
 * - **Position Notional_i**: Single symbol position notional sum
 * - **position_qty_i**: Single symbol position quantity
 * - **entry_price_i**: Single symbol entry price (avg. open price)
 *
 * ## Example
 *
 * **Position unrealized ROI** = Position unrealized PNL / (IMR_i * abs(position_qty_i * entry_price_i)) * 100% = 216.69 / (0.1 * abs(-3 * 1710.64)) * 100% = 42.22%
 *
 * **ETH IMR_i** = Max(1/10, 0.1, 0.0000003754 * abs(-4915.23)^(4/5)) = Max(0.1, 0.1, 0.000337077174) = 0.1
 *
 * - Max Account Leverage = 10
 * - ETH Base IMR_i = 0.1
 * - ETH IMR Factor_i = 0.0000003754
 * - ETH position_qty_i = -3
 * - ETH entry_price_i = 1710.64
 * - ETH mark_price_i = 1638.41
 * - ETH Position Notional = -3 * 1638.41 = -4915.23
 * - ETH Position unrealized PNL = 216.69
 *
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
 * @formulaId totalUnrealizedPnl
 * @name Total Unrealized PNL
 * @formula Total Unrealized PNL = sum ( unrealized_pnl_i ), unrealized_pnl_i = position_qty_i * ( mark_price_i - entry_price _i )
 * @description
 * ## Term Definitions
 *
 * - **Total Unrealized PNL**: Sum of all current unrealized profit and loss for user's positions
 * - **unrealized_pnl_i**: Current unrealized profit and loss for a single symbol
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 * - **entry_price_i**: Single symbol entry price (avg. open price)
 *
 * ## Example
 *
 * **BTC-PERP unrealized_pnl_i** = 0.2 * (25986.2 - 26067) = -16.16
 *
 * **ETH-PERP unrealized_pnl_i** = -3 * (1638.41 - 1710.64) = 216.69
 *
for example 

BTC-PERP unrealized_pnl_i = 0.2 * (25986.2 - 26067) = -16.16

ETH-PERP unrealized_pnl_i = -3 * (1638.41 - 1710.64) = 216.69

Total Unrealized PNL = -16.16 + 216.69 = 200.53
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
 * @formulaId liqPrice
 * @name Position Liquidation Price
 * @formula Position Liq. Price = max(mark_price_i + (total_collateral_value - sum(abs(position_qty_i) * mark_price_i * MMR_i)) / (abs(position_qty_i) * MMR_i - position_qty_i), 0)
 * @description
 * ## Term Definitions
 *
 * - **Position Liq. Price**: Single symbol position liquidation price
 * - **total_collateral_value**: Total asset value of user account margin (USDC denominated)
 * - **total_notional**: Sum of current position notional values
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 * - **MMR_i**: Single symbol maintenance margin rate
 * - **Base MMR_i**: Single symbol base maintenance margin rate
 * - **Base IMR_i**: Single symbol base initial margin rate
 * - **IMR Factor_i**: Single symbol IMR calculation factor, from v1/client/info
 * - **Position Notional_i**: Single symbol position notional sum
 *
 * ## MMR Formula
 *
 * MMR_i = Max(Base MMR_i, (Base MMR_i / Base IMR_i) * IMR Factor_i * Abs(Position Notional_i)^(4/5))
 *
 * ## Example - BTC Position
 *
 * **BTC Position Liq. Price** = max(25986.2 + (1981.66 - 505.6215) / (abs(0.2) * 0.05 - 0.2), 0) = 18217.57
 *
 * - total_collateral_value = 1981.66
 * - sum(abs(position_qty_i) * mark_price_i * MMR_i) = 505.6215
 * - BTC: abs(position_qty_i) * mark_price_i * MMR_i = 5197.2 * 0.05
 * - ETH: abs(position_qty_i) * mark_price_i * MMR_i = 4915.23 * 0.05
 * - BTC MMR_i = Max(0.05, (0.05 / 0.1) * 0.0000002512 * 5197.2^(4/5)) = Max(0.05, 0.000117924809) = 0.05
 * - position_qty_i = 0.2
 * - mark_price_i = 25986.2
 *
 * ## Example - ETH Position
 *
 * **ETH Position Liq. Price** = max(1638.41 + (1981.66 - 505.6215) / (abs(-3) * 0.05 + 3), 0) = 2106.99365
 *
 * - ETH MMR_i = Max(0.05, (0.05 / 0.1) * 0.0000003754 * 4915.23^(4/5)) = Max(0.05, 0.000168538587) = 0.05
 * - position_qty_i = -3
 * - mark_price_i = 1638.41
 *
 * @param inputs The inputs for calculating the liquidation price.
 * @returns The liquidation price of the position.
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
 * @formulaId maintenanceMargin
 * @name Position maintenance margin
 * @formula Position maintenance margin = abs (position_qty_i  * mark_price_i * MMR_i )
 * @description
 * ## Term Definitions
 *
 * - **Position maintenance margin**: Single symbol maintenance margin
 * - **MMR_i**: Single symbol maintenance margin rate
 * - **Base MMR_i**: Single symbol base maintenance margin rate
 * - **Base IMR_i**: Single symbol base initial margin rate
 * - **IMR Factor_i**: Single symbol IMR calculation factor, from v1/client/info
 * - **Position Notional_i**: Single symbol position notional sum
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 *
 * ## MMR Formula
 *
 * MMR_i = Max(Base MMR_i, (Base MMR_i / Base IMR_i) * IMR Factor_i * Abs(Position Notional_i)^(4/5))
 *
 * ## Example
 *
 * **BTC Position maintenance margin** = abs(position_qty_i * mark_price_i * MMR_i) = abs(0.2 * 25986.2 * 0.05) = 259.86
 *
 * **BTC MMR_i** = Max(0.05, (0.05 / 0.1) * 0.0000002512 * 5197.2^(4/5)) = Max(0.05, 0.000117924809) = 0.05
 *
 * - BTC Base MMR_i = 0.05
 * - BTC Base IMR_i = 0.1
 * - BTC IMR Factor_i = 0.0000002512
 * - Abs(BTC Position Notional_i) = 5197.2
 * - position_qty_i = 0.2
 * - mark_price_i = 25986.2
 *
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
 * @formulaId unsettlementPnl
 * @name Position Unrealized PNL
 * @formula Position Unrealized PNL = position_qty_i * (mark_price_i - entry_price_i)
 * @description
 * ## Term Definitions
 *
 * - **Position Unrealized PNL**: Single symbol unrealized profit and loss
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 * - **entry_price_i**: Single symbol entry price (avg. open price)
 *
 * ## Example
 *
 * **ETH Position Unrealized PNL** = position_qty_i * (mark_price_i - entry_price_i) = -3 * (1638.41 - 1710.64) = 216.69
 *
 * - ETH position_qty_i = -3
 * - ETH mark_price_i = 1638.41
 * - ETH entry_price_i = 1710.64
 *
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
 * @formulaId totalUnsettlementPnL
 * @name Total Unsettlement PNL
 * @formula Unsettlement PNL = position_qty_i * mark_price_i - cost_position_i - position_qty_i * (sum_unitary_funding_i - last_sum_unitary_funding_i)
 * @description
 * ## Term Definitions
 *
 * - **total unsettlement PNL**: Sum of user account's unsettled PNL
 * - **mark_price_i**: Single symbol mark price
 * - **position_qty_i**: Single symbol position quantity
 * - **cost_position_i**: Single symbol notional snapshot from last settlement, `/v1/position`
 * - **sum_unitary_funding_i**: Single symbol current cumulative unit funding fee, `/v1/public/funding_rate`
 * - **last_sum_unitary_funding_i**: Single symbol cumulative unit funding fee from last settlement, `/v1/position`
 *
 * ## Example
 *
 * **BTC-PERP Unsettlement PNL** = 0.2 * 25986.2 - 5197.2 - 0.2 * (-1585.92 + 1583.92) = 0.44
 *
 * **ETH-PERP Unsettlement PNL** = -3 * 1638.41 + 4902.45 + 3 * (-52.728 + 50.728) = -18.78
 *
 * **Total Unsettlement PNL** = 0.44 - 18.78 = -18.34
 *
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
 * @formulaId MMR
 * @name Position Maintenance Margin Rate
 * @formula MMR_i = Max(Base MMR_i, (Base MMR_i / Base IMR_i) * IMR Factor_i * Abs(Position Notional_i)^(4/5))
 * @description
 * ## Term Definitions
 *
 * - **MMR_i**: Single symbol maintenance margin rate
 * - **Base MMR_i**: Single symbol base maintenance margin rate
 * - **Base IMR_i**: Single symbol base initial margin rate
 * - **IMR Factor_i**: Single symbol IMR calculation factor, from v1/client/info
 * - **Position Notional_i**: Single symbol position notional sum
 * - **position_qty_i**: Single symbol position quantity
 * - **mark_price_i**: Single symbol mark price
 *
 * ## Example
 *
 * **BTC MMR_i** = Max(0.05, (0.05 / 0.1) * 0.0000002512 * 5197.2^(4/5)) = Max(0.05, 0.000117924809) = 0.05
 *
 * - BTC Base MMR_i = 0.05
 * - BTC Base IMR_i = 0.1
 * - BTC IMR Factor_i = 0.0000002512
 * - Abs(BTC Position Notional_i) = 5197.2
 * - position_qty_i = 0.2
 * - mark_price_i = 25986.2
 *
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
 * @formulaId maxPositionNotional
 * @description calculate the max position notional
 * @formula max_notional = ( (1/ (leverage * imr_factor) ) ^ (1/0.8)
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
