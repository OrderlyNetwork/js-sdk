"use client";

import { useContext } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { OrderlyContext } from "./orderlyContext";

import { get } from "@orderly/net";

const fetcher = (url: string) => fetch(url,).then((res) => res.json());

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: string,
  options?: SWRConfiguration
): SWRResponse<T> => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  // check the query is public api
  if (!query.startsWith("/public")) {
    throw new Error("useQuery is only for public api");
  }

  if (typeof apiBaseUrl === "undefined") {
    throw new Error("please add OrderlyProvider to your app");
  }

  return useSWR<T>(`${apiBaseUrl}${query}`, fetcher, options);
};
