import { useEffect, useMemo } from "react";
import { mutate } from "swr";
import { API, MarginMode } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWS } from "../useWS";

/**
 * A hook to fetch and subscribe to leverage for a given trading symbol.
 * It initially fetches the leverage data via a private query and then listens for real-time
 * updates through a WebSocket subscription to keep the leverage value current.
 *
 * @param symbol - The trading symbol (e.g. "PERP_BTC_USDC")
 * @param marginMode - Optional margin mode (CROSS or ISOLATED). If not provided, defaults to CROSS.
 * @returns The current leverage value associated with the symbol, or undefined if not available
 *
 * @example
 * ```typescript
 * const leverage = useLeverageBySymbol("PERP_BTC_USDC");
 * const isolatedLeverage = useLeverageBySymbol("PERP_BTC_USDC", MarginMode.ISOLATED);
 * ```
 */
export const useLeverageBySymbol = (
  symbol?: string,
  marginMode?: MarginMode,
) => {
  const { state } = useAccount();
  const ws = useWS();

  const queryUrl = useMemo(() => {
    if (!symbol) return null;
    const queryParams = new URLSearchParams();
    queryParams.set("symbol", symbol);
    if (marginMode) {
      queryParams.set("margin_mode", marginMode);
    }
    return `/v1/client/leverage?${queryParams.toString()}`;
  }, [symbol, marginMode]);

  const { data } = usePrivateQuery<API.LeverageInfo>(queryUrl, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (!state.accountId || !symbol) return;

    const unsubscribe = ws.privateSubscribe("account", {
      onMessage: (data: any) => {
        const res = data?.accountDetail?.symbolLeverage || {};
        // update leverage when symbol leverage changed
        if (res.symbol === symbol) {
          // update leverage by swr to fix displayed previous value at short time when switching symbol.
          const key = [queryUrl, state.accountId];
          mutate(key, (prevData: any) => {
            return {
              ...prevData,
              //TODO: different margin mode leverage value
              leverage: res.leverage,
            };
          });
        }
      },
    });

    return () => unsubscribe?.();
  }, [symbol, state.accountId, queryUrl]);

  return data?.leverage;
};
