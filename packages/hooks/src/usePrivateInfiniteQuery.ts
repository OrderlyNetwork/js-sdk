import { useEffect } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite, {
  type SWRInfiniteKeyLoader,
  type SWRInfiniteConfiguration,
} from "swr/infinite";
import { get } from "@orderly.network/net";
import { AccountStatusEnum } from "@orderly.network/types";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { useAccount } from "./useAccount";
import { registerOrderQueryRefresh } from "./utils/orderQueryRefresh";

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
      use: [signatureMiddleware, ...middleware],
    },
  );

  useEffect(() => {
    let firstKey: unknown;
    try {
      firstKey = getKey?.(0, null);
    } catch {
      // SWR treats throwing key loaders as dependencies that are not ready.
      return;
    }
    return registerOrderQueryRefresh(cache, firstKey, state.accountId, () =>
      result.mutate(),
    );
  }, [cache, getKey, state.accountId, result.mutate]);
  return result;
};
