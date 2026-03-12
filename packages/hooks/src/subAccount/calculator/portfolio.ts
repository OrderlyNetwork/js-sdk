import { pathOr } from "ramda";
import { account } from "@orderly.network/perp";
import { API, MarginMode } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { SymbolsInfo } from "../../orderly/useSymbolsInfo";
import { createGetter } from "../../utils/createGetter";
import { parseHolding } from "../../utils/parseHolding";

export type Portfolio = {
  holding?: API.Holding[];
  totalCollateral: Decimal;
  freeCollateral: Decimal;
  freeCollateralUSDCOnly: Decimal;
  totalValue: Decimal | null;
  availableBalance: number;
  unsettledPnL: number;
  totalUnrealizedROI: number;
};

export function formatPortfolio(inputs: {
  holding?: API.Holding[];
  positions?: API.PositionsTPSLExt;
  markPrices: Record<string, number> | null;
  indexPrices?: Record<string, number> | null;
  accountInfo?: API.AccountInfo;
  symbolsInfo?: SymbolsInfo;
  tokensInfo?: API.Token[];
}) {
  const {
    holding,
    positions,
    markPrices,
    indexPrices,
    accountInfo,
    symbolsInfo,
    tokensInfo,
  } = inputs;

  if (
    !holding ||
    !positions ||
    !Array.isArray(positions.rows) ||
    !markPrices ||
    !indexPrices ||
    !accountInfo ||
    symbolsInfo?.isNil
  ) {
    return null;
  }

  const totallCrossUnsettledPnL = positions.rows.reduce(
    (sum, pos) =>
      pos.margin_mode === MarginMode.ISOLATED
        ? sum
        : sum + (pos.unsettled_pnl ?? 0),
    0,
  );
  const totalUnsettlementPnL = positions.rows.reduce(
    (sum, pos) => sum + (pos.unsettled_pnl ?? 0),
    0,
  );
  const unrealizedPnL = pathOr(0, ["total_unreal_pnl"])(positions);

  const [USDC_holding, nonUSDC] = parseHolding(
    holding,
    indexPrices,
    tokensInfo!,
  );

  const usdc = holding.find((item) => item.token === "USDC");

  const totalCollateral = account.totalCollateral({
    USDCHolding: USDC_holding,
    nonUSDCHolding: nonUSDC,
    unsettlementPnL: totallCrossUnsettledPnL,
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
    totalUnsettlementPnL: totalUnsettlementPnL,
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

  // TODO: Pass actual orders data for accurate initial margin calculation
  const totalInitialMarginWithOrders = account.totalInitialMarginWithQty({
    positions: positions.rows,
    orders: [],
    markPrices,
    IMR_Factors: accountInfo.imr_factor,
    maxLeverageBySymbol,
    symbolInfo: createGetter({ ...symbolsInfo }),
  });

  const freeCollateral = account.freeCollateral({
    totalCollateral,
    totalInitialMarginWithOrders,
  });

  const freeCollateralUSDCOnly = account.freeCollateralUSDCOnly({
    freeCollateral,
    nonUSDCHolding: nonUSDC,
  });

  const availableBalance = account.availableBalance({
    USDCHolding: usdc?.holding ?? 0,
    unsettlementPnL: positions.total_unsettled_pnl ?? 0,
  });

  return {
    totalCollateral,
    totalValue,
    totalUnrealizedROI,
    freeCollateral,
    availableBalance,
    unsettledPnL: totalUnsettlementPnL,
    holding,
    freeCollateralUSDCOnly,
  };
}
