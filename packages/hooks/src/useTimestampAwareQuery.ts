import useSWR, { SWRHook, SWRResponse } from "swr";
import { SDKError } from "@orderly.network/types";
import { timestampWaitingMiddleware } from "./middleware/timestampWaitingMiddleware";
import { useConfig } from "./useConfig";
import { fetcher, useQueryOptions } from "./utils";

/**
 * useTimestampAwareQuery
 * @description Query hook that waits for timestamp offset to be initialized before making requests
 * @param query
 * @param options
 */
export const useTimestampAwareQuery = <T>(
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
    {
      ...swrOptions,
      use: [timestampWaitingMiddleware, ...(swrOptions.use || [])],
    },
  );
};
