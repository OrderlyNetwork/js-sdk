import { i18n } from "@orderly.network/i18n";
import { parseBinarySymbol } from "@orderly.network/utils";
import type { BinaryMarket } from "./binary/binaryMarkets";

export const formatPredictionMarketName = (
  market: Pick<BinaryMarket, "base" | "period">,
) =>
  i18n.t("prediction.marketName", { base: market.base, period: market.period });

/**
 * Display name ("BTC UP/DOWN 5M") of a round binary symbol such as
 * `PERP_BTC5M2608271200_USDC`, or undefined when the symbol is not a binary
 * round symbol. Reads the live i18n instance, so re-call after a language
 * switch.
 */
export const formatBinarySymbolName = (symbol?: string): string | undefined => {
  const parsed = symbol ? parseBinarySymbol(symbol) : undefined;
  return parsed ? formatPredictionMarketName(parsed) : undefined;
};

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
