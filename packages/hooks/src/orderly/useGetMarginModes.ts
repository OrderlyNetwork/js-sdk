import { useMemo } from "react";
import { MarginMode } from "@orderly.network/types";
import { usePrivateQuery } from "../usePrivateQuery";

/**
 * A hook to fetch default margin modes for all symbols.
 *
 * @returns An object containing:
 * - `marginModes`: A map of symbol to margin mode (Record<string, MarginMode>)
 * - `isLoading`: Boolean indicating if data is being loaded
 * - `error`: Error object if the request failed
 * - `refresh`: Function to manually refresh the data
 *
 * @example
 * ```typescript
 * const { marginModes, isLoading, error, refresh } = useGetMarginModes();
 *
 * // Get margin mode for a specific symbol
 * const btcMode = marginModes["PERP_BTC_USDC"]; // MarginMode.CROSS | MarginMode.ISOLATED | undefined
 * ```
 */
export const useGetMarginModes = () => {
  const { data, error, isLoading, mutate } = usePrivateQuery<
    Array<{ symbol: string; default_margin_mode: MarginMode }>
  >("/v1/client/margin_modes", {
    revalidateOnFocus: false,
  });

  const marginModesMap = useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    const map: Record<string, MarginMode> = {};
    for (const item of data) {
      map[item.symbol] = item.default_margin_mode;
    }
    return map;
  }, [data]);

  return {
    marginModes: marginModesMap,
    isLoading,
    error,
    refresh: mutate,
  };
};
