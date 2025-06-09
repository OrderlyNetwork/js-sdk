import { useMemo } from "react";
import { useQuery } from "../useQuery";
import { useAccountInfo } from "./useAccountInfo";

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
 * const leverage = useSymbolLeverage("PERP_BTC_USDC");
 * console.log(`Maximum leverage for PERP_BTC_USDC: ${leverage}x`);
 * ```
 */
export const useSymbolLeverage = (symbol: string): number | "-" => {
  const { data: info } = useAccountInfo();

  const maxAccountLeverage = info?.max_leverage;

  const res = useQuery<any>(`/v1/public/info/${symbol}`, {
    dedupingInterval: 1000 * 60 * 60 * 24, // 24 hours
    revalidateOnFocus: false,
    errorRetryCount: 2,
    errorRetryInterval: 200,
  });

  /**
   * Calculates the maximum leverage for the symbol based on its base initial margin requirement (IMR)
   */
  const maxSymbolLeverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
  }, [res]);

  /**
   * Determines the final maximum leverage by taking the minimum between
   * account leverage limit and symbol leverage limit
   */
  const maxLeverage = useMemo(() => {
    if (!maxAccountLeverage || !maxSymbolLeverage) {
      return "-";
    }

    return Math.min(maxAccountLeverage, maxSymbolLeverage);
  }, [maxAccountLeverage, maxSymbolLeverage]);

  return maxLeverage;
};
