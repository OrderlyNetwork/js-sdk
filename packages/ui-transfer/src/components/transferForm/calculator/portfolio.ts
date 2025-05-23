import { pathOr } from "ramda";
import { SymbolInfo } from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

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

type NonUSDCHolding = {
  holding: number;
  markPrice: number;
  // margin replacement rate, default 0
  discount: number;
};

export const parseHolding = (
  holding: API.Holding[],
  markPrices: Record<string, number>,
): [number, NonUSDCHolding[]] => {
  const nonUSDC: NonUSDCHolding[] = [];

  let USDC_holding = 0;

  holding.forEach((item) => {
    if (item.token === "USDC") {
      USDC_holding = item.holding;
    } else {
      nonUSDC.push({
        holding: item.holding,
        markPrice: markPrices[item.token] ?? 0,
        // markPrice: 0,
        discount: 0,
      });
    }
  });

  return [USDC_holding, nonUSDC];
};
