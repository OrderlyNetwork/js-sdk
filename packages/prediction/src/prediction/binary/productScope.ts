import { INDEX_SYMBOL_PATTERN, parseBinaryRoundSymbol } from "./binaryMarkets";

/** Match every Binary period and round for the underlying Perp market. */
export const matchesPredictionUnderlying = (
  predictionSymbol: string | undefined,
  underlyingPerpSymbol: string | undefined,
) => {
  if (!underlyingPerpSymbol) return true;
  const underlying = INDEX_SYMBOL_PATTERN.exec(underlyingPerpSymbol);
  const prediction = parseBinaryRoundSymbol(predictionSymbol);
  return Boolean(
    underlying &&
    prediction &&
    prediction.base === underlying[1] &&
    prediction.quote === underlying[2],
  );
};
