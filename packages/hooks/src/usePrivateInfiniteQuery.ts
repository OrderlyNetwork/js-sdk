import useSWRInfinite, {
  type SWRInfiniteKeyLoader,
  type SWRInfiniteConfiguration,
} from "swr/infinite";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { get } from "@orderly.network/net";
import { useAccount } from "./useAccount";
import { AccountStatusEnum } from "@orderly.network/types";

export const usePrivateInfiniteQuery = (
  getKey: SWRInfiniteKeyLoader,
  options?: SWRInfiniteConfiguration & {
    formatter?: (data: any) => any;
  }
) => {
  const { formatter, ...restOptions } = options || {};
  const account = useAccount();

  const middleware = Array.isArray(restOptions?.use)
    ? restOptions?.use ?? []
    : [];

  const result = useSWRInfinite(
    (pageIndex: number, previousPageData) => {
      const queryKey = getKey(pageIndex, previousPageData);
      if (account.state.status < AccountStatusEnum.EnableTrading || !queryKey) {
        return null;
      }
      return [queryKey, account.state.accountId];
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
