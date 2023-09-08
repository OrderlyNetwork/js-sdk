"use client";

import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { signatureMiddleware } from "./middleware/signatureMiddleware";

import { fetcher, useQueryOptions } from "./utils/fetcher";
import { useAccount } from "./useAccount";
import { AccountStatusEnum } from "@orderly.network/types";

// const fetcher = (url: string, init: RequestInit) => get(url, init);
/**
 * usePrivateQuery
 * @description for private api
 * @param query
 * @param options
 */
export const usePrivateQuery = <T>(
  query: string,
  // query: Parameters<typeof useSWR>["0"],
  options?: useQueryOptions<T>
): SWRResponse<T> => {
  const { formatter, ...swrOptions } = options || {};
  const account = useAccount();
  // check the query is public api

  const middleware = Array.isArray(options?.use) ? options?.use ?? [] : [];

  // @ts-ignore
  return useSWR<T>(
    () =>
      account.state.status >= AccountStatusEnum.EnableTrading ? query : null,
    // query,
    (url, init) => {
      return fetcher(url, init, { formatter });
    },
    {
      ...swrOptions,
      use: [signatureMiddleware, ...middleware],
      onError: (err) => {
        console.log("usePrivateQuery error", err);
      },
    }
  );
};
