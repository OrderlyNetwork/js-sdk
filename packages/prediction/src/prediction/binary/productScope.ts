import { parseBinaryRoundSymbol, parseIndexPriceSymbol } from "./binaryMarkets";

/**
 * Match every Binary period and round for the underlying market. Accepts the
 * underlying index in either format (`PERP_BTC_USDC` or `SPOT_BTCTWAP60S_USDC`).
 */
export const matchesPredictionUnderlying = (
  predictionSymbol: string | undefined,
  underlyingIndexSymbol: string | undefined,
) => {
  if (!underlyingIndexSymbol) return true;
  const underlying = parseIndexPriceSymbol(underlyingIndexSymbol);
  const prediction = parseBinaryRoundSymbol(predictionSymbol);
  return Boolean(
    underlying &&
    prediction &&
    prediction.base === underlying.base &&
    prediction.quote === underlying.quote,
  );
};
