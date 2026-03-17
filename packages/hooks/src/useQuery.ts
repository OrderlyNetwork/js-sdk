import { useCallback } from "react";
import useSWR from "swr";
import type { SWRHook, SWRResponse } from "swr";
import { usePluginScope } from "@orderly.network/plugin-core";
import { SDKError } from "@orderly.network/types";
import { useConfig } from "./useConfig";
import { fetcher, useQueryOptions } from "./utils/fetcher";

/** Header name for plugin ID attribution (API tracing, rate limiting) */
export const PLUGIN_ID_HEADER = "X-Orderly-Plugin-Id";

/**
 * useQuery
 * @description for public api. Injects X-Orderly-Plugin-Id when inside PluginScopeProvider.
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: Parameters<SWRHook>[0],
  options?: useQueryOptions<T>,
): SWRResponse<T> => {
  const apiBaseUrl = useConfig("apiBaseUrl");
  const pluginScope = usePluginScope();
  const { formatter, ...swrOptions } = options || {};

  if (typeof apiBaseUrl === "undefined") {
    throw new SDKError("please add OrderlyConfigProvider to your app");
  }

  const fetcherFn = useCallback(
    (url: string, init?: RequestInit) => {
      const fullUrl = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
      const headers = new Headers(init?.headers);
      if (pluginScope?.pluginId) {
        headers.set(PLUGIN_ID_HEADER, pluginScope.pluginId);
      }
      return fetcher(fullUrl, { ...init, headers }, { formatter });
    },
    [apiBaseUrl, pluginScope?.pluginId, formatter],
  );

  return useSWR<T>(query, fetcherFn, swrOptions);
};
