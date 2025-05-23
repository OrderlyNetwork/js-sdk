import {
  type SWRConfiguration,
  type SWRHook,
  type SWRResponse,
  type Middleware,
  useAccount,
  useSWR,
  fetcher,
  useConfig,
  useAccountInstance,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";

export type QueryOptions<T> = SWRConfiguration & {
  formatter?: (data: any) => T;
  accountId?: string;
};

export function useSubAccountQuery<T>(
  query: Parameters<SWRHook>[0],
  options?: QueryOptions<T>,
): SWRResponse<T> {
  const { formatter, accountId, ...swrOptions } = options || {};
  const { state, account } = useAccount();
  const middleware = Array.isArray(options?.use) ? (options?.use ?? []) : [];

  return useSWR<T>(
    () =>
      accountId &&
      (state.status >= AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
        ? [query, accountId]
        : null,
    (url: string, init: RequestInit) => {
      return fetcher(url, init, { formatter });
    },
    {
      ...swrOptions,
      use: [...middleware, signatureMiddleware(account, accountId)],
      onError: () => {},
    },
  );
}

function signatureMiddleware(
  account: ReturnType<typeof useAccountInstance>,
  accountId?: string,
): Middleware {
  const apiBaseUrl = useConfig("apiBaseUrl");

  return (useSWRNext: SWRHook) => {
    return (key, fetcher, config) => {
      try {
        const extendedFetcher = async (args: any) => {
          const url = Array.isArray(args) ? args[0] : args;

          const fullUrl = `${apiBaseUrl}${url}`;

          const signer = account.signer;

          const payload: MessageFactor = {
            method: "GET",
            url,
          };

          const signature = await signer.sign(payload, getTimestamp());

          // @ts-ignore
          return fetcher(fullUrl, {
            headers: {
              ...signature,
              "orderly-account-id": accountId,
            },
          });
        };
        return useSWRNext(key, extendedFetcher, config);
      } catch (e) {
        console.error("signature error:", e);
        throw e;
      }
    };
  };
}

export type MessageFactor = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
};
