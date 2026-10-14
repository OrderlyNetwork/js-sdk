import { API } from "@orderly.network/types";
import { formatPositions as formatAccountPositions } from "../../orderly/calculator/formatPositions";
import type { SymbolsInfo } from "../../orderly/useSymbolsInfo";
import { resolveSymbolsInfo } from "./symbolConfig";

export function formatPositions(
  data: API.PositionInfo | API.PositionsTPSLExt,
  accountInfo?: API.AccountInfo,
  symbolsInfo?: SymbolsInfo,
  fundingRates?: Record<string, API.FundingRate>,
): API.PositionsTPSLExt {
  return formatAccountPositions(data, {
    accountInfo,
    symbolsInfo: resolveSymbolsInfo(data.rows, symbolsInfo),
    fundingRates,
  });
}

export function calcByPrice(
  positions?: API.PositionInfo,
  markPrice?: Record<string, number>,
  indexPrice?: Record<string, number>,
) {
  if (!positions || !Array.isArray(positions.rows) || !positions.rows.length) {
    return positions;
  }

  return {
    ...positions,
    rows: positions.rows.map((item) => ({
      ...item,
      mark_price: markPrice?.[item.symbol] ?? item.mark_price,
      index_price:
        indexPrice?.[item.symbol] ?? item.index_price ?? item.mark_price,
    })),
  };
}
