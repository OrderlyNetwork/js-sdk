import useSWR from "swr";
import { fetcher } from "./utils/fetcher";
import useSWRMutation, {
  type SWRMutationConfiguration,
  SWRMutationResponse,
} from "swr/mutation";
import { useConfig } from "./useConfig";
import { SDKError } from "@orderly.network/types";

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
  const apiBaseUrl = useConfig("apiBaseUrl");
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
        const queryString = Object.entries(options.arg)
          .map(
            ([key, value]) => `${key}=${encodeURIComponent(value as string)}`
          )
          .join("&");
        url = `${url}?${queryString}`;
      }
      return fetcher(url, init, {
        formatter,
      });
    },
    swrOptions
  );
};
