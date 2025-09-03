import { useMemo } from "react";
import { useMutation } from "../useMutation";
import { useSymbolsInfo } from "./useSymbolsInfo";

/**
 * A custom hook that calculates the maximum allowed leverage for a given trading pair symbol.
 *
 * The final leverage is determined by taking the minimum value between the account's maximum
 * leverage and the symbol's maximum leverage.
 *
 * @param symbol - Trading pair symbol (e.g. "PERP_BTC_USDC")
 * @returns The maximum allowed leverage as a number, or "-" if the leverage cannot be determined
 *
 * @example
 * ```typescript
 * const leverage = useMaxSymbolLeverage("PERP_BTC_USDC");
 * console.log(`Maximum leverage for PERP_BTC_USDC: ${leverage}x`);
 * ```
 */
export const useSymbolLeverages = (symbol: string) => {
  const symbolsInfo = useSymbolsInfo();
  const symbolInfo = useMemo(() => symbolsInfo[symbol], [symbolsInfo, symbol]);

  const [update, { isMutating }] = useMutation("/v1/client/leverage");

  /**
   * Calculates the maximum leverage for the symbol based on its base initial margin requirement (IMR)
   */
  const maxSymbolLeverage = useMemo(() => {
    const baseIMR = symbolInfo("base_imr");
    return baseIMR ? 1 / baseIMR : 1;
  }, [symbolInfo]);

  return {
    maxSymbolLeverage,
    update,
    isLoading: isMutating,
    symbolInfo,
  };
};
