"use client";

import { useContext } from "react";
import useSWR from "swr";
import { OrderlyContext } from "./orderlyContext";

import { fetcher } from "./utils/fetcher";
import useSWRMutation, {
  type SWRMutationConfiguration,
  SWRMutationResponse,
} from "swr/mutation";

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useLazyQuery = <T, R = any>(
  query: Parameters<typeof useSWR>["0"],
  options?: SWRMutationConfiguration<any, any> & {
    formatter?: (data: any) => R;
    init?: RequestInit;
  }
): SWRMutationResponse => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  const { formatter, init, ...swrOptions } = options || {};
  // check the query is public api
  // if (typeof query === "string" && !query.startsWith("/v1/public")) {
  //   throw new Error("useQuery is only for public api");
  // }

  if (typeof apiBaseUrl === "undefined") {
    throw new Error("please add OrderlyProvider to your app");
  }

  // @ts-ignore
  return useSWRMutation(
    query,
    (url: string, options: any) => {
      console.log(url, options);
      // const {init,arg} = options;
      url = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
      if (options?.arg) {
        // const searchParams = new URLSearchParams(init.arg);
        // url = `${url}?${encodeURIComponent(searchParams.toString())}`;
        const queryString = Object.entries(options.arg)
          .map(
            ([key, value]) => `${key}=${encodeURIComponent(value as string)}`
          )
          .join("&");
        url = `${url}?${queryString}`;
      }
      // return fetch(url);
      return fetcher(url, init, {
        formatter,
      });
    },
    swrOptions
  );
};
