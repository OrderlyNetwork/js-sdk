import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite, {
  unstable_serialize,
  type SWRInfiniteKeyLoader,
  type SWRInfiniteConfiguration,
} from "swr/infinite";
import { get } from "@orderly.network/net";
import { AccountStatusEnum } from "@orderly.network/types";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { useAccount } from "./useAccount";
import {
  registerOrderQueryRefresh,
  scheduleOrderQueryRefresh,
} from "./utils/orderQueryRefresh";

export const usePrivateInfiniteQuery = <T>(
  getKey: SWRInfiniteKeyLoader | null,
  options?: SWRInfiniteConfiguration & {
    formatter?: (data: any) => any;
  },
) => {
  const { formatter, ...restOptions } = options || {};
  const { state } = useAccount();
  const { cache } = useSWRConfig();

  const middleware = Array.isArray(restOptions?.use)
    ? (restOptions?.use ?? [])
    : [];

  let firstKey: unknown;
  try {
    firstKey = getKey?.(0, null);
  } catch {
    // SWR treats throwing key loaders as dependencies that are not ready.
  }
  const queryKey = unstable_serialize(() =>
    firstKey &&
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected)
      ? [firstKey, state.accountId]
      : null,
  );
  const previousKey = useRef(queryKey);
  // Coordinate cached activations instead of fetching page one before a full refresh.
  const activate =
    previousKey.current !== queryKey &&
    /(?:^|\/)v1\/(?:algo\/)?orders(?:\?|$)/.test(String(firstKey)) &&
    cache.get(queryKey)?.data !== undefined;

  const result = useSWRInfinite<T>(
    (pageIndex: number, previousPageData) => {
      if (!getKey) return null;

      const queryKey = getKey(pageIndex, previousPageData);
      if (
        queryKey &&
        (state.status >= AccountStatusEnum.EnableTrading ||
          state.status === AccountStatusEnum.EnableTradingWithoutConnected)
      ) {
        return [queryKey, state.accountId];
      }

      return null;
    },
    (url: string, init: RequestInit) => {
      return restOptions.fetcher?.(url, init) || get(url, init, formatter);
    },
    {
      ...restOptions,
      ...(activate
        ? { revalidateIfStale: false, revalidateOnMount: false }
        : {}),
      use: [signatureMiddleware, ...middleware],
    },
  );

  // Keep pending reports when a loader changes identity but its URL does not.
  useEffect(
    () =>
      registerOrderQueryRefresh(cache, firstKey, state.accountId, () =>
        result.mutate(),
      ),
    [cache, firstKey, state.accountId, result.mutate],
  );
  useEffect(() => {
    const changed = previousKey.current !== queryKey;
    previousKey.current = queryKey;
    if (
      changed &&
      typeof firstKey === "string" &&
      state.accountId &&
      cache.get(queryKey)?.data !== undefined
    )
      scheduleOrderQueryRefresh(
        cache,
        firstKey,
        state.accountId,
        () => true,
        false,
      );
  }, [cache, queryKey, firstKey, state.accountId]);
  return result;
};
