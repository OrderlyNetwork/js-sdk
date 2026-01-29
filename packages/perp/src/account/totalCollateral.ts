import { Decimal, zero } from "@orderly.network/utils";

/**
 * @formulaId totalCollateral
 * @name Total Collateral
 * @formula Total collateral = usdc balance.holding + SUM(non-usdc balance.holding * mark price * discount) + total unsettlement PNL
 * @description
 *
 * ## Definition
 *
 * **discount**: Collateral substitution rate
 *
 * **Total collateral**: Total value of collateral assets in the user's account (denominated in USDC)
 *
 * **usdc balance.holding**: USDC holding quantity
 *
 * **non-usdc balance.holding * mark price**: Value of non-USDC asset holdings (denominated in USDC)
 *
 * **holding**: Asset quantity held by the user, from `/v1/client/holding` or v2 Websocket API | Balance
 *
 * **mark price**: Current price of the asset, from v2 Websocket API | Balance
 *
 * **total unsettlement PNL**: Sum of user's account unsettled PNL
 *
 * ## Example
 *
 * ```
 * Total collateral = 2000 + 1000 * 1.001 * 0 - 18.34 = 1981.66
 * total unsettlement PNL = -18.34
 * ```
 */
export function totalCollateral(inputs: {
  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    indexPrice: number;
    collateralCap: number;
    collateralRatio: Decimal;
  }[];
  /**
   * Sum of user's account unsettled PNL
   */
  unsettlementPnL: number;
  /**
   * @description USDC balance frozen for pending short orders (for freeCollateral calculation)
   * @default 0
   */
  usdcBalancePendingShortQty?: number;
  /**
   * @description USDC balance frozen for isolated margin orders (for freeCollateral calculation)
   * @default 0
   */
  usdcBalanceIsolatedOrderFrozen?: number;
  /**
   * @description Total cross margin unsettled PNL (for freeCollateral calculation). If provided, this will be used instead of unsettlementPnL.
   */
  totalCrossUnsettledPnL?: number;
}): Decimal {
  const {
    USDCHolding,
    nonUSDCHolding,
    unsettlementPnL,
    usdcBalancePendingShortQty = 0,
    usdcBalanceIsolatedOrderFrozen = 0,
    totalCrossUnsettledPnL,
  } = inputs;

  // Calculate USDC part: holding + pending_short_qty - isolated_order_frozen
  const usdcPart = new Decimal(USDCHolding)
    .add(usdcBalancePendingShortQty)
    .sub(usdcBalanceIsolatedOrderFrozen);

  // Calculate non-USDC holdings value
  const nonUSDCHoldingValue = nonUSDCHolding.reduce<Decimal>((acc, cur) => {
    const finalHolding = Math.min(cur.holding, cur.collateralCap);
    const value = new Decimal(finalHolding)
      .mul(cur.collateralRatio)
      .mul(cur.indexPrice);
    return acc.add(value);
  }, zero);

  // Use totalCrossUnsettledPnL if provided, otherwise use unsettlementPnL
  const pnl =
    totalCrossUnsettledPnL !== undefined
      ? totalCrossUnsettledPnL
      : unsettlementPnL;

  return usdcPart.add(nonUSDCHoldingValue).add(pnl);
}
