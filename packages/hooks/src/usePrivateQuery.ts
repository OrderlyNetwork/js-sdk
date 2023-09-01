"use client";

import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { signatureMiddleware } from "./middleware/signatureMiddleware";

import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";
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

  // console.log(
  //   "lunch usePrivateQuery, account state ",
  //   query,
  //   account.state.status
  // );

  // console.log("usePrivateQuery account", account.state);

  // @ts-ignore
  return useSWR<T>(
    () => (account.state.status >= AccountStatusEnum.SignedIn ? query : null),
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
