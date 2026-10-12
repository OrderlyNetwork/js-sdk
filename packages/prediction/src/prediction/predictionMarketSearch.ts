import { i18n } from "@orderly.network/i18n";
import type { BinaryMarket } from "./binary/binaryMarkets";

export const formatPredictionMarketName = (market: BinaryMarket) =>
  i18n.t("prediction.marketName", { base: market.base, period: market.period });

/** Match the same fields in dedicated and supplemental Prediction lists. */
export function filterPredictionMarkets(
  markets: BinaryMarket[],
  searchValue?: string,
): BinaryMarket[] {
  const search = searchValue?.trim().toLowerCase() ?? "";
  if (!search) return markets;
  return markets.filter((market) =>
    `${formatPredictionMarketName(market)} ${market.id} ${market.indexPriceSymbol}`
      .toLowerCase()
      .includes(search),
  );
}
