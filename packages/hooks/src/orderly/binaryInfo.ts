import { useEffect, useMemo } from "react";
import { type API } from "@orderly.network/types";
import { getPrecisionByNumber } from "@orderly.network/utils";
import { useQuery } from "../useQuery";
import { useAppStore } from "./appStore";

/**
 * Same key as the prediction page's `useBinaryRounds` query, so SWR shares
 * one cache entry instead of issuing parallel requests for the same snapshot.
 */
export const BINARY_INFO_QUERY_KEY = "/v1/public/binary/info";

/**
 * Map a Binary info snapshot (api-spec §3.1/§4: latest 300 four-state
 * rounds, server-refreshed every minute) into symbol-config records the
 * calculators can consume.
 *
 * The payload carries the regular trading parameters but no `base_imr` /
 * `base_mmr`: the binary PRD fixes imr=1 and mmr=0 for every binary symbol
 * (they are the reason binary never liquidates), so those two values are
 * mirrored here rather than invented. Everything else — funding params,
 * est. liquidation price, mark UPnL — keeps flowing through the normal
 * ISOLATED perps pipeline and is hidden by the UI per PRD §16.
 */
export const toBinarySymbolsInfo = (
  rows: API.BinaryInfoRow[] | undefined | null,
): Record<string, API.SymbolExt> => {
  const obj: Record<string, API.SymbolExt> = {};
  if (!Array.isArray(rows)) return obj;

  for (const item of rows) {
    if (!item?.symbol) continue;
    const arr = item.symbol.split("_");
    obj[item.symbol] = {
      ...(item as unknown as API.Symbol),
      base_dp: getPrecisionByNumber(item.base_tick ?? 0.01),
      quote_dp: getPrecisionByNumber(item.quote_tick ?? 0.01),
      base: arr[1],
      quote: arr[2],
      type: arr[0],
      name: `${arr[1]}-${arr[0]}`,
      // PRD-fixed binary margin config: imr=1 (1x), mmr=0 (never liquidates).
      base_imr: 1,
      base_mmr: 0,
    };
  }
  return obj;
};

const binaryInfoQueryOptions = {
  revalidateOnFocus: false,
  focusThrottleInterval: 1000 * 60 * 60 * 24,
  dedupingInterval: 1000 * 30,
  // Environments without the binary endpoint degrade to the calculator's
  // pass-through path for binary rows; keep retries bounded.
  errorRetryCount: 3,
  errorRetryInterval: 10_000,
};

/**
 * Account-level observer enabled by raw Binary positions or pending quantities.
 * Shares the Prediction page's snapshot cache without depending on its UI gate.
 * Returns the configuration revision so the caller can recalculate positions
 * after the synchronization effect has written it to the calculator store.
 */
export const useBinaryInfoObserver = (enabled: boolean) => {
  const setBinarySymbolsInfo = useAppStore(
    (state) => state.actions.setBinarySymbolsInfo,
  );

  const { data } = useQuery<API.BinaryInfoRow[]>(
    enabled ? BINARY_INFO_QUERY_KEY : null,
    {
      ...binaryInfoQueryOptions,
      // A null key stops requests, but SWR still schedules a nonzero interval.
      refreshInterval: enabled ? 60_000 : 0,
    },
  );
  const binarySymbolsInfo = useMemo(
    () => (Array.isArray(data) ? toBinarySymbolsInfo(data) : undefined),
    [data],
  );

  // Observe shared cache data even when another consumer owns the request.
  useEffect(() => {
    if (enabled && binarySymbolsInfo !== undefined) {
      setBinarySymbolsInfo(binarySymbolsInfo);
    }
  }, [enabled, binarySymbolsInfo, setBinarySymbolsInfo]);

  return enabled ? binarySymbolsInfo : undefined;
};
