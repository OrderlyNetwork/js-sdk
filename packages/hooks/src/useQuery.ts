import useSWR, { SWRResponse } from "swr";
import { fetcher, useQueryOptions } from "./utils/fetcher";
import { useConfig } from "./useConfig";
import { SDKError } from "@orderly.network/types";

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
  const apiBaseUrl = useConfig("apiBaseUrl");
  const { formatter, ...swrOptions } = options || {};

  if (typeof apiBaseUrl === "undefined") {
    throw new SDKError("please add OrderlyConfigProvider to your app");
  }

  // @ts-ignore
  return useSWR<T>(
    query,
    (url, init) =>
      fetcher(url.startsWith("http") ? url : `${apiBaseUrl}${url}`, init, {
        formatter,
      }),
    swrOptions
  );
};
