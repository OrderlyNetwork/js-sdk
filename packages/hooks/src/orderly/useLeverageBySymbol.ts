import { useEffect } from "react";
import { mutate } from "swr";
import { API } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWS } from "../useWS";

/**
 * A hook to fetch and subscribe to leverage for a given trading symbol.
 * It initially fetches the leverage data via a private query and then listens for real-time
 * updates through a WebSocket subscription to keep the leverage value current.
 *
 * @param symbol - The trading symbol (e.g. "PERP_BTC_USDC")
 * @returns The current leverage value associated with the symbol, or undefined if not available
 *
 * @example
 * ```typescript
 * const leverage = useLeverageBySymbol("PERP_BTC_USDC");
 * ```
 */
export const useLeverageBySymbol = (symbol?: string) => {
  const { state } = useAccount();
  const ws = useWS();

  const { data } = usePrivateQuery<API.LeverageInfo>(
    symbol ? `/v1/client/leverage?symbol=${symbol}` : null,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!state.accountId || !symbol) return;

    const unsubscribe = ws.privateSubscribe("account", {
      onMessage: (data: any) => {
        const res = data?.accountDetail?.symbolLeverage || {};
        // update leverage when symbol leverage changed
        if (res.symbol === symbol) {
          // update leverage by swr to fix displayed previous value at short time when switching symbol.
          const key = [`/v1/client/leverage?symbol=${symbol}`, state.accountId];
          mutate(key, (prevData: any) => {
            return {
              ...prevData,
              leverage: res.leverage,
            };
          });
        }
      },
    });

    return () => unsubscribe?.();
  }, [symbol, state.accountId]);

  return data?.leverage;
};
