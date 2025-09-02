import { useMemo } from "react";
import { useMutation } from "../useMutation";
import { useQuery } from "../useQuery";

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
  const res = useQuery<any>(`/v1/public/info/${symbol}`, {
    dedupingInterval: 1000 * 60 * 60 * 24, // 24 hours
    revalidateOnFocus: false,
    errorRetryCount: 2,
    errorRetryInterval: 200,
  });

  const [update, { isMutating }] = useMutation("/v1/client/leverage");

  /**
   * Calculates the maximum leverage for the symbol based on its base initial margin requirement (IMR)
   */
  const maxSymbolLeverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
    return 1;
  }, [res]);

  return {
    maxSymbolLeverage,
    update,
    isLoading: isMutating,
  };
};
