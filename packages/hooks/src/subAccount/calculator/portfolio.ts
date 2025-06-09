import { pathOr } from "ramda";
import { account } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { SymbolInfo } from "../../orderly/useSymbolsInfo";
import { parseHolding } from "../../utils/parseHolding";

export type Portfolio = {
  holding?: API.Holding[];
  totalCollateral: Decimal;
  freeCollateral: Decimal;
  totalValue: Decimal | null;
  availableBalance: number;
  unsettledPnL: number;
  totalUnrealizedROI: number;
};

export function formatPortfolio(inputs: {
  holding?: API.Holding[];
  positions?: API.PositionsTPSLExt;
  markPrices: Record<string, number> | null;
  accountInfo?: API.AccountInfo;
  symbolsInfo?: SymbolInfo;
}) {
  const { holding, positions, markPrices, accountInfo, symbolsInfo } = inputs;

  if (
    !holding ||
    !positions ||
    !Array.isArray(positions.rows) ||
    !markPrices ||
    !accountInfo ||
    symbolsInfo?.isNil
  ) {
    return null;
  }

  const unsettledPnL = pathOr(0, ["total_unsettled_pnl"])(positions);
  const unrealizedPnL = pathOr(0, ["total_unreal_pnl"])(positions);

  const [USDC_holding, nonUSDC] = parseHolding(holding, markPrices);
  const usdc = holding.find((item) => item.token === "USDC");

  const totalCollateral = account.totalCollateral({
    USDCHolding: USDC_holding,
    nonUSDCHolding: nonUSDC,
    unsettlementPnL: unsettledPnL,
  });

  const totalValue = account.totalValue({
    totalUnsettlementPnL: unsettledPnL,
    USDCHolding: USDC_holding,
    nonUSDCHolding: nonUSDC,
  });

  const totalUnrealizedROI = account.totalUnrealizedROI({
    totalUnrealizedPnL: unrealizedPnL,
    totalValue: totalValue.toNumber(),
  });

  const totalInitialMarginWithOrders = account.totalInitialMarginWithQty({
    positions: positions.rows,
    markPrices,
    IMR_Factors: accountInfo.imr_factor,
    maxLeverage: accountInfo.max_leverage,
    symbolInfo: symbolsInfo,
  });

  const freeCollateral = account.freeCollateral({
    totalCollateral,
    totalInitialMarginWithOrders,
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
    unsettledPnL,
    holding,
  };
}
