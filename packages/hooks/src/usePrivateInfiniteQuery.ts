import useSWRInfinite, {
  type SWRInfiniteKeyLoader,
  type SWRInfiniteConfiguration,
} from "swr/infinite";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { get } from "@orderly.network/net";
import { useAccount } from "./useAccount";
import { AccountStatusEnum } from "@orderly.network/types";

export const usePrivateInfiniteQuery = <T>(
  getKey: SWRInfiniteKeyLoader,
  options?: SWRInfiniteConfiguration & {
    formatter?: (data: any) => any;
  }
) => {
  const { formatter, ...restOptions } = options || {};
  const { state } = useAccount();

  const middleware = Array.isArray(restOptions?.use)
    ? restOptions?.use ?? []
    : [];

  const result = useSWRInfinite<T>(
    (pageIndex: number, previousPageData) => {
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
    }
  );

  return result;
};
