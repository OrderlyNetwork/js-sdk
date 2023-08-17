"use client";

import { useContext } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { OrderlyContext } from "./orderlyContext";

import { get } from "@orderly/net";

const fetcher = (url: string, queryOptions: useQueryOptions<any>) =>
  get(url, {}, queryOptions?.formatter);

export type useQueryOptions<T> = {
  formatter?: (data:any) => T;
};

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: string,
  options?: SWRConfiguration & useQueryOptions<T>
): SWRResponse<T> => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  const { formatter, ...swrOptions } = options || {};
  // check the query is public api
  if (!query.startsWith("/public")) {
    throw new Error("useQuery is only for public api");
  }

  if (typeof apiBaseUrl === "undefined") {
    throw new Error("please add OrderlyProvider to your app");
  }

  // @ts-ignore
  return useSWR<T>(
    `${apiBaseUrl}${query}`,
    (url) => fetcher(url, { formatter }),
    swrOptions
  );
};
