import { API } from "@orderly.network/types";
import type { Portfolio as AccountPortfolio } from "../../orderly/appStore";
import { formatPortfolio as formatAccountPortfolio } from "../../orderly/calculator/formatPortfolio";
import type { SymbolsInfo } from "../../orderly/useSymbolsInfo";
import { resolveSymbolsInfo } from "./symbolConfig";

export type Portfolio = Omit<AccountPortfolio, "usdcHolding">;

export function formatPortfolio(inputs: {
  holding?: API.Holding[];
  positions?: API.PositionsTPSLExt;
  markPrices: Record<string, number> | null;
  indexPrices?: Record<string, number> | null;
  accountInfo?: API.AccountInfo;
  symbolsInfo?: SymbolsInfo;
  tokensInfo?: API.Token[];
}) {
  const symbolsInfo = resolveSymbolsInfo(
    inputs.positions?.rows ?? [],
    inputs.symbolsInfo,
  );
  const portfolio = formatAccountPortfolio({
    ...inputs,
    symbolsInfo,
    perpSymbolsInfo: symbolsInfo,
  });
  return portfolio && { ...portfolio, holding: [...portfolio.holding] };
}
