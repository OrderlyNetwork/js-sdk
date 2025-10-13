import useSWR from "swr";
import type { SWRHook, SWRResponse } from "swr";
import { SDKError } from "@kodiak-finance/orderly-types";
import { useConfig } from "./useConfig";
import { fetcher, useQueryOptions } from "./utils/fetcher";

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: Parameters<SWRHook>[0],
  options?: useQueryOptions<T>,
): SWRResponse<T> => {
  const apiBaseUrl = useConfig("apiBaseUrl");
  const { formatter, ...swrOptions } = options || {};

  if (typeof apiBaseUrl === "undefined") {
    throw new SDKError("please add OrderlyConfigProvider to your app");
  }

  return useSWR<T>(
    query,
    (url, init) =>
      fetcher(url.startsWith("http") ? url : `${apiBaseUrl}${url}`, init, {
        formatter,
      }),
    swrOptions,
  );
};
