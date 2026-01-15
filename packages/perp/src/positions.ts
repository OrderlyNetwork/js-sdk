import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";
import { DMax } from "./utils";

const MaxIterates = 30;
const CONVERGENCE_THRESHOLD = 0.0001;

// ============ Backward Compatibility Types ============
/** @deprecated Use inline type or the new input type instead */
export type UnrealPnLInputs = {
  markPrice: number;
  openPrice: number;
  qty: number;
};

/** @deprecated Use inline type or the new input type instead */
export type UnrealPnLROIInputs = {
  positionQty: number;
  openPrice: number;
  IMR: number;
  unrealizedPnL: number;
};

/** @deprecated Use inline type or the new input type instead */
export type LiqPriceInputs = {
  markPrice: number;
  totalCollateral: number;
  positionQty: number;
  positions: Pick<API.PositionExt, "position_qty" | "mark_price" | "mmr">[];
  MMR: number;
};
// ====================================================

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

/**
 * @formulaId unrealizedPnL
 * @description Calculates the unrealized profit or loss of a single position.
 * This formula applies to both cross margin and isolated margin positions.
 * @formula Unrealized PnL = position_qty * (mark_price - entry_price)
 * @param inputs The inputs for calculating the unrealized profit or loss.
 * @returns The unrealized profit or loss of the position (in USDC).
 */
export function unrealizedPnL(inputs: {
  /** symbol mark price */
  markPrice: number;
  /** symbol open price (entry price) */
  openPrice: number;
  /** symbol quantity (position quantity, positive for long, negative for short) */
  qty: number;
}): number {
  return new Decimal(inputs.qty)
    .mul(inputs.markPrice - inputs.openPrice)
    .toNumber();
}

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
export function unrealizedPnLROI(inputs: {
  positionQty: number;
  openPrice: number;
  IMR: number;
  unrealizedPnL: number;
}): number {
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
 * ```
 * BTC-PERP unrealized_pnl_i = 0.2 * (25986.2 - 26067) = -16.16
 * ETH-PERP unrealized_pnl_i = -3 * (1638.41 - 1710.64) = 216.69
 *
 * Total Unrealized PNL = -16.16 + 216.69 = 200.53
 * ```
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

/**
 * @formulaId liqPrice
 * @name Position Liquidation Price
 * @description
 *
 * ## Define:
 *
 * ### (1) calculate_liq_price function
 *
 * ```
 * calculate_liq_price( mark_price, position_qty, mmr )
 * ```
 *
 * If `position_qty >= 0` AND if `abs(position_qty) * mmr - position_qty >= 0`:
 *
 * Return `mark_price`
 *
 * Else:
 *
 * Return `max( mark_price + [ total_collateral_value - abs(position_qty) * mark_price * mmr - mm_for_other_symbols ] / [ abs(position_qty) * mmr - position_qty ], 0 )`
 *
 * Where `total_collateral_value` and `mm_for_other_symbols` are constants.
 *
 * - **total_collateral_value**
 * - **mm_for_other_symbols** = `sum_i ( abs(position_qty_i) * mark_price_i * mmr_i )` for i != current symbol
 *
 * ### (2) compare_collateral_w_mm function
 *
 * ```
 * compare_collateral_w_mm( price ) = collateral >= mm
 * ```
 *
 * Where:
 * - **collateral** = `total_collateral_value - position_qty_i * mark_price + position_qty_i * price`
 * - **mm** = `abs(position_qty_i) * price * Max(Base MMR i, (Base MMR i / Base IMR i) * IMR Factor i * Abs(position_qty_i * price)^(4/5)) + mm_for_other_symbols`
 *
 * ## Given:
 *
 * Position liquidation price for symbol i with:
 * - current mark price = `mark_price_i`
 * - current position qty = `position_qty_i`
 * - current mmr = `mmr_i = Max(Base MMR i, (Base MMR i / Base IMR i) * IMR Factor i * Abs(Position Notional i)^(4/5))`
 * - symbol base mmr = `base_mmr_i`
 *
 * ## For LONG position
 *
 * ```
 * liq_price_left = calculate_liq_price( mark_price_i, position_qty_i, base_mmr_i )
 * liq_price_right = calculate_liq_price( mark_price_i, position_qty_i, mmr_i )
 *
 * ITERATE 30 times:
 *     if liq_price_left >= liq_price_right:
 *         return liq_price_right
 *
 *     mid = ( liq_price_left + liq_price_right ) / 2
 *
 *     if compare_collateral_w_mm( mid ):
 *         liq_price_right = mid
 *     else:
 *         liq_price_left = mid
 *
 *     if (liq_price_right - liq_price_left) / (liq_price_left + liq_price_right) * 2 <= 0.0001:
 *         break
 *
 * return liq_price_right
 * ```
 *
 * ## For SHORT position
 *
 * ```
 * liq_price_right = calculate_liq_price( mark_price_i, position_qty_i, mmr_i )
 * liq_price_left = calculate_liq_price( mark_price_i, position_qty_i,
 *   Max(Base MMR i, (Base MMR i / Base IMR i) * IMR Factor i * Abs(position_qty_i * liq_price_right)^(4/5))
 * )
 *
 * ITERATE 30 times:
 *     if liq_price_left >= liq_price_right:
 *         return liq_price_left
 *
 *     mid = ( liq_price_left + liq_price_right ) / 2
 *
 *     if compare_collateral_w_mm( mid ):
 *         liq_price_left = mid
 *     else:
 *         liq_price_right = mid
 *
 *     if (liq_price_right - liq_price_left) / (liq_price_left + liq_price_right) * 2 <= 0.0001:
 *         break
 *
 * return liq_price_left
 * ```
 *
 * @returns The liquidation price of the position.
 */
export function liqPrice(inputs: {
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
}): number | null {
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
}

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
export function maintenanceMargin(inputs: {
  positionQty: number;
  markPrice: number;
  MMR: number;
}) {
  const { positionQty, markPrice, MMR } = inputs;

  return new Decimal(positionQty).mul(markPrice).mul(MMR).abs().toNumber();
}

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
export function unsettlementPnL(inputs: {
  positionQty: number;
  markPrice: number;
  costPosition: number;
  sumUnitaryFunding: number;
  lastSumUnitaryFunding: number;
}): number {
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
export function MMR(inputs: {
  baseMMR: number;
  baseIMR: number;
  IMRFactor: number;
  positionNotional: number;
  IMR_factor_power: number;
}): number {
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

/**
 * @formulaId liquidationPriceIsolated
 * @name Liquidation Price for Isolated Margin Position
 * @formula liquidation_price = (isolated_position_margin' - cost_position' - funding_adjustment) / (abs(position_qty') * MMR' - position_qty')
 * funding_adjustment = position_qty' * (sum_unitary_funding - last_sum_unitary_funding)
 * position_qty' = position_qty + order_side * order_qty
 * MMR' = max(base_MMR, (base_MMR / base_IMR) * IMR_factor * abs(position_qty' * reference_price)^(4/5))
 * @description
 *
 * ## Definition
 *
 * **liquidation_price**: Price at which the isolated margin position will be liquidated
 *
 * **isolated_position_margin'**: Isolated position margin after order execution (if applicable)
 *
 * **cost_position'**: Position cost after order execution (if applicable)
 *
 * **funding_adjustment**: Adjustment for funding fees
 *
 * **position_qty'**: Position quantity after order execution
 *
 * **MMR'**: Maintenance margin rate after order execution
 *
 * ## Scenarios
 *
 * ### 1. No Order (order_qty = 0)
 * - `isolated_position_margin' = isolated_position_margin`
 * - `cost_position' = cost_position`
 *
 * ### 2. Open/Add Position (position_qty = 0 or order_side = sign(position_qty))
 * - `isolated_position_margin' = isolated_position_margin + order_qty * reference_price / leverage`
 * - `cost_position' = cost_position + order_side * order_qty * reference_price`
 *
 * ### 3. Close/Reduce Position (order_side ≠ sign(position_qty) and sign(position_qty') = sign(position_qty))
 * - `isolated_position_margin' = isolated_position_margin * position_qty' / position_qty`
 * - `cost_position' = cost_position + order_side * order_qty * reference_price`
 *
 * ### 4. Flip Position (order_side ≠ sign(position_qty) and sign(position_qty') ≠ sign(position_qty))
 * - `isolated_position_margin' = abs(position_qty') * reference_price / leverage`
 * - `cost_position' = position_qty' * reference_price`
 *
 * ## Example
 *
 * ```
 * isolated_position_margin = 2000
 * cost_position = 100000
 * position_qty = 2 (long)
 * sum_unitary_funding = 0.001
 * last_sum_unitary_funding = 0.0008
 * base_MMR = 0.025
 * base_IMR = 0.04
 * IMR_factor = 0.0000001
 * reference_price = 50000
 * liquidation_price = (2000 - 100000 - 0.0004) / (2 * 0.025 - 2) ≈ 50256.41
 * ```
 *
 * @param inputs Input parameters for calculating liquidation price
 * @returns Liquidation price (in USDC) or null if invalid
 */
export function liquidationPriceIsolated(inputs: {
  /**
   * @description Current isolated position margin
   */
  isolatedPositionMargin: number;
  /**
   * @description Current position cost
   */
  costPosition: number;
  /**
   * @description Current position quantity (positive for long, negative for short)
   */
  positionQty: number;
  /**
   * @description Current cumulative unitary funding
   */
  sumUnitaryFunding: number;
  /**
   * @description Last cumulative unitary funding (at last settlement)
   */
  lastSumUnitaryFunding: number;
  /**
   * @description Base maintenance margin rate
   */
  baseMMR: number;
  /**
   * @description Base initial margin rate
   */
  baseIMR: number;
  /**
   * @description IMR calculation factor
   */
  IMRFactor: number;
  /**
   * @description Reference price (mark price for current position, or order price for estimated liquidation)
   */
  referencePrice?: number;
  /**
   * @description Order side (BUY = +1, SELL = -1) for calculating estimated liquidation after order execution
   */
  orderSide?: "BUY" | "SELL";
  /**
   * @description Order quantity for calculating estimated liquidation after order execution
   */
  orderQty?: number;
  /**
   * @description Leverage for the position
   */
  leverage: number;
}): number | null {
  const {
    isolatedPositionMargin,
    costPosition,
    positionQty,
    sumUnitaryFunding,
    lastSumUnitaryFunding,
    baseMMR,
    baseIMR,
    IMRFactor,
    referencePrice,
    orderSide,
    orderQty = 0,
    leverage,
  } = inputs;

  // Use reference price or mark price (default to a reasonable value if not provided)
  const refPrice = referencePrice ?? 0;
  if (refPrice <= 0 && orderQty !== 0) {
    return null;
  }

  // Calculate position_qty' after order execution
  const orderSideMultiplier =
    orderSide === "BUY" ? 1 : orderSide === "SELL" ? -1 : 0;
  const newPositionQty = positionQty + orderSideMultiplier * orderQty;

  if (newPositionQty === 0) {
    return null; // No position after order execution
  }

  // Determine scenario and calculate isolated_position_margin' and cost_position'
  let newIsolatedPositionMargin: Decimal;
  let newCostPosition: Decimal;

  if (orderQty === 0) {
    // Scenario 1: No order
    newIsolatedPositionMargin = new Decimal(isolatedPositionMargin);
    newCostPosition = new Decimal(costPosition);
  } else if (
    positionQty === 0 ||
    (orderSideMultiplier > 0 && positionQty > 0) ||
    (orderSideMultiplier < 0 && positionQty < 0)
  ) {
    // Scenario 2: Open/Add position
    newIsolatedPositionMargin = new Decimal(isolatedPositionMargin).add(
      new Decimal(orderQty).mul(refPrice).div(leverage),
    );
    newCostPosition = new Decimal(costPosition).add(
      new Decimal(orderSideMultiplier).mul(orderQty).mul(refPrice),
    );
  } else {
    const signPositionQty = positionQty > 0 ? 1 : -1;
    const signNewPositionQty = newPositionQty > 0 ? 1 : -1;

    if (signNewPositionQty === signPositionQty) {
      // Scenario 3: Close/Reduce position
      newIsolatedPositionMargin = new Decimal(isolatedPositionMargin)
        .mul(newPositionQty)
        .div(positionQty);
      newCostPosition = new Decimal(costPosition).add(
        new Decimal(orderSideMultiplier).mul(orderQty).mul(refPrice),
      );
    } else {
      // Scenario 4: Flip position
      newIsolatedPositionMargin = new Decimal(Math.abs(newPositionQty))
        .mul(refPrice)
        .div(leverage);
      newCostPosition = new Decimal(newPositionQty).mul(refPrice);
    }
  }

  // Calculate funding adjustment
  const fundingAdjustment = new Decimal(newPositionQty).mul(
    new Decimal(sumUnitaryFunding).sub(lastSumUnitaryFunding),
  );

  // Calculate MMR' based on new position notional
  const newPositionNotional = new Decimal(Math.abs(newPositionQty)).mul(
    refPrice,
  );
  const dynamicMMR = new Decimal(baseMMR)
    .div(baseIMR)
    .mul(IMRFactor)
    .mul(newPositionNotional.toPower(IMRFactorPower))
    .toNumber();
  const newMMR = Math.max(baseMMR, dynamicMMR);

  // Calculate denominator: abs(position_qty') * MMR' - position_qty'
  const denominator = new Decimal(Math.abs(newPositionQty))
    .mul(newMMR)
    .sub(newPositionQty);

  if (denominator.isZero()) {
    return null; // Invalid denominator
  }

  // Calculate liquidation price
  const numerator = newIsolatedPositionMargin
    .sub(newCostPosition)
    .sub(fundingAdjustment);

  const liquidationPrice = numerator.div(denominator).toNumber();

  // Return null for invalid prices (negative or zero)
  if (liquidationPrice <= 0) {
    return null;
  }

  return liquidationPrice;
}
