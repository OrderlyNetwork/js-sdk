/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SWRHook } from "swr";
import type {
  SWRMutationResponse,
  SWRMutationConfiguration,
} from "swr/mutation";
import useSWRMutation from "swr/mutation";
import { usePluginScope } from "@orderly.network/plugin-core";
import { SDKError } from "@orderly.network/types";
import { useConfig } from "./useConfig";
import { PLUGIN_ID_HEADER } from "./useQuery";
import { fetcher } from "./utils/fetcher";

/**
 * useLazyQuery
 * @description Lazily requests public APIs and preserves plugin attribution headers.
 * @param query
 * @param options
 */
export const useLazyQuery = <T, R = any>(
  query: Parameters<SWRHook>[0],
  options?: SWRMutationConfiguration<any, any> & {
    formatter?: (data: any) => R;
    init?: RequestInit;
  },
): SWRMutationResponse<any, any, Parameters<SWRHook>[0], any> => {
  const apiBaseUrl = useConfig("apiBaseUrl");
  const pluginScope = usePluginScope();
  const { formatter, init, ...swrOptions } = options || {};
  // check the query is public api
  // if (typeof query === "string" && !query.startsWith("/v1/public")) {
  //   throw new SDKError("useQuery is only for public api");
  // }

  if (typeof apiBaseUrl === "undefined") {
    throw new SDKError("please add OrderlyConfigProvider to your app");
  }

  // @ts-ignore
  return useSWRMutation(
    query,
    (url: string, options: any) => {
      url = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
      if (options?.arg) {
        // const searchParams = new URLSearchParams(init.arg);
        // url = `${url}?${encodeURIComponent(searchParams.toString())}`;
        const queryString = Object.entries<string>(options.arg)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
        url = `${url}?${queryString}`;
      }
      const headers = new Headers(init?.headers);
      if (pluginScope?.pluginId)
        headers.set(PLUGIN_ID_HEADER, pluginScope.pluginId);
      return fetcher(url, { ...init, headers }, { formatter });
    },
    swrOptions,
  );
};
