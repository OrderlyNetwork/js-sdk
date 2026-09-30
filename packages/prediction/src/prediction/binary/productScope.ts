import { parseBinaryRoundSymbol } from "./binaryMarkets";

const PERP_SYMBOL_PATTERN = /^PERP_([A-Z0-9]+)_([A-Z0-9]+)$/;

/** Match every Binary period and round for the underlying Perp market. */
export const matchesPredictionUnderlying = (
  predictionSymbol: string | undefined,
  underlyingPerpSymbol: string | undefined,
) => {
  if (!underlyingPerpSymbol) return true;
  const underlying = PERP_SYMBOL_PATTERN.exec(underlyingPerpSymbol);
  const prediction = parseBinaryRoundSymbol(predictionSymbol);
  return Boolean(
    underlying &&
    prediction &&
    prediction.base === underlying[1] &&
    prediction.quote === underlying[2],
  );
};
