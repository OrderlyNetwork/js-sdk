import { Decimal, zero } from "@orderly.network/utils";

export type FreeCollateralUSDCOnlyInputs = {
  /**
   * Free collateral (total_collateral_value - total_initial_margin_with_orders).
   * @see freeCollateral
   */
  freeCollateral: Decimal;
  /**
   * Non-USDC token holdings; same structure as in totalCollateral.
   * Each item contributes (capped_holding × index_price × discount) to the sum to subtract.
   */
  nonUSDCHolding: {
    holding: number;
    indexPrice: number;
    collateralCap: number;
    collateralRatio: Decimal;
  }[];
};

/**
 * @formulaId freeCollateralUSDCOnly
 * @name Free Collateral (USDC Only)
 * @formula Free Collateral USDC Only = max(0, free_collateral - SUM(non_usdc_token.holding × mark_price × discount))
 * @description
 *
 * ## Definition
 *
 * **Free Collateral (USDC Only)**: Part of free collateral that is backed only by USDC (and unsettled PNL), i.e. excluding the value of non-USDC collateral.
 *
 * **free_collateral**: From freeCollateral (total_collateral_value - total_initial_margin_with_orders).
 *
 * **non_usdc_token.holding × mark_price × discount**: Same as in totalCollateral — value of each non-USDC asset (capped by collateralCap), using indexPrice as mark price and collateralRatio as discount.
 *
 * ## Example
 *
 * ```
 * free_collateral = 550
 * SUM(non_usdc.holding × mark_price × discount) = 1 * 2000 * 0.9 = 1800
 * Free Collateral USDC Only = max(0, 550 - 1800) = 0
 * ```
 */
export function freeCollateralUSDCOnly(
  inputs: FreeCollateralUSDCOnlyInputs,
): Decimal {
  const { freeCollateral, nonUSDCHolding } = inputs;

  const nonUSDCHoldingValue = nonUSDCHolding.reduce<Decimal>((acc, cur) => {
    const finalHolding = Math.min(cur.holding, cur.collateralCap);
    const value = new Decimal(finalHolding)
      .mul(cur.collateralRatio)
      .mul(cur.indexPrice);
    return acc.add(value);
  }, zero);

  const value = freeCollateral.sub(nonUSDCHoldingValue);
  return value.isNegative() ? zero : value;
}
