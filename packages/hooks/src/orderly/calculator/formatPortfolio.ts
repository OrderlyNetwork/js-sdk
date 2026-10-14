import { pathOr } from "ramda";
import { account } from "@orderly.network/perp";
import { API, MarginMode } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { createGetter } from "../../utils/createGetter";
import { parseHolding } from "../../utils/parseHolding";

export type PortfolioInputs = {
  holding?: API.Holding[] | ReadonlyArray<API.Holding>;
  positions?: API.PositionsTPSLExt;
  markPrices: Record<string, number> | null;
  indexPrices?: Record<string, number> | null;
  accountInfo?: API.AccountInfo;
  symbolsInfo?: Record<string, API.SymbolExt>;
  perpSymbolsInfo?: Record<string, API.SymbolExt>;
  tokensInfo?: ReadonlyArray<API.Token>;
};

/** Shared equity and funding limits for current and observed subaccounts. */
export function formatPortfolio(inputs: PortfolioInputs) {
  const {
    holding,
    positions,
    markPrices,
    indexPrices,
    accountInfo,
    symbolsInfo,
    perpSymbolsInfo,
    tokensInfo = [],
  } = inputs;

  if (
    !holding ||
    !positions ||
    !Array.isArray(positions.rows) ||
    !markPrices ||
    !indexPrices ||
    !accountInfo ||
    !symbolsInfo ||
    !perpSymbolsInfo
  ) {
    return null;
  }

  // const totallCrossUnsettledPnL1 = positions.rows.reduce(
  //   (sum, pos) =>
  //     pos.margin_mode === MarginMode.ISOLATED
  //       ? sum
  //       : sum + (pos.unsettled_pnl ?? 0),
  //   0,
  // );

  const unsettledPnL = pathOr(0, ["total_unsettled_pnl"])(positions);
  // Keep the existing ordinary Perp funding limits independent of Binary PnL.
  const perpUnsettledPnL = positions.rows
    .reduce<Decimal>((sum, row) => {
      if (!perpSymbolsInfo?.[row.symbol]) return sum;
      return sum.add(row.unsettled_pnl ?? 0);
    }, zero)
    .toNumber();
  const unsettledCrossPnL = pathOr(0, ["total_unsettled_cross_pnl"])(positions);
  const unrealizedPnL = pathOr(0, ["total_unreal_pnl"])(positions);

  const [USDC_holding, nonUSDC] = parseHolding(
    holding,
    indexPrices,
    tokensInfo,
  );

  const usdc = holding.find((item) => item.token === "USDC");

  const totalCollateral = account.totalCollateral({
    USDCHolding: USDC_holding,
    nonUSDCHolding: nonUSDC,
    unsettlementPnL: unsettledCrossPnL,
    usdcBalancePendingShortQty: usdc?.pending_short ?? 0,
    usdcBalanceIsolatedOrderFrozen: usdc?.isolated_order_frozen ?? 0,
  });

  const sumIsolatedMargin = positions.rows.reduce<Decimal>((acc, curr) => {
    if (curr.margin_mode !== MarginMode.ISOLATED) {
      return acc;
    }
    return acc.add(curr.margin ?? 0);
  }, zero);

  const totalValue = account.totalValue({
    totalUnsettlementPnL: unsettledPnL,
    USDCHolding: USDC_holding,
    nonUSDCHolding: nonUSDC,
    totalIsolatedPositionMargin: sumIsolatedMargin.toNumber(),
  });

  const totalUnrealizedROI = account.totalUnrealizedROI({
    totalUnrealizedPnL: unrealizedPnL,
    totalValue: totalValue.toNumber(),
  });
  const maxLeverageBySymbol = positions.rows.reduce<Record<string, number>>(
    (acc, position) => {
      if (
        position.margin_mode !== MarginMode.ISOLATED &&
        position.leverage &&
        !acc[position.symbol]
      ) {
        acc[position.symbol] = position.leverage;
      }
      return acc;
    },
    {},
  );

  const totalInitialMarginWithOrders = account.totalInitialMarginWithQty({
    positions: positions.rows,
    markPrices,
    IMR_Factors: accountInfo.imr_factor,
    maxLeverageBySymbol,
    symbolInfo: createGetter({ ...symbolsInfo }),
  });

  const freeCollateral = account.freeCollateral({
    totalCollateral,
    totalInitialMarginWithOrders,
  });

  // TODO: op code
  const freeCollateralUSDCOnly = account.freeCollateralUSDCOnly({
    freeCollateral,
    nonUSDCHolding: nonUSDC,
  });

  const availableBalance = account.availableBalance({
    USDCHolding: usdc?.holding ?? 0,
    unsettlementPnL: perpUnsettledPnL,
  });

  return {
    totalCollateral,
    totalValue,
    totalUnrealizedROI,
    freeCollateral,
    availableBalance,
    unsettledPnL,
    perpUnsettledPnL,
    holding,
    usdcHolding: USDC_holding,
    freeCollateralUSDCOnly,
  };
}
