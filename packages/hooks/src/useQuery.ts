"use client";

import { useContext } from "react";
import useSWR, { SWRResponse } from "swr";
import { OrderlyContext } from "./orderlyContext";

import { fetcher, useQueryOptions } from "./utils/fetcher";

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: Parameters<typeof useSWR>["0"],
  options?: useQueryOptions<T>
): SWRResponse<T> => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  const { formatter, ...swrOptions } = options || {};
  // check the query is public api
  // if (typeof query === "string" && !query.startsWith("/v1/public")) {
  //   throw new Error("useQuery is only for public api");
  // }

  if (typeof apiBaseUrl === "undefined") {
    throw new Error("please add OrderlyProvider to your app");
  }

  // query = Array.isArray(query) ? [...query,] : [query];

  // @ts-ignore
  return useSWR<T>(
    // `${apiBaseUrl}${query}`,
    query,
    (url, init) =>
      fetcher(url.startsWith("http") ? url : `${apiBaseUrl}${url}`, init, {
        formatter,
      }),
    swrOptions
  );
};
