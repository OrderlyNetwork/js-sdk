import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { get } from "@orderly/net";
import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

const fetcher = (url: string, init: RequestInit) => get(url, init);
/**
 * usePrivateQuery
 * @description for private api
 * @param query
 * @param options
 */
export const usePrivateQuery = <T>(
  // query: string,
  query: Parameters<typeof useSWR>["0"],
  options?: SWRConfiguration
): SWRResponse<T> => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  // check the query is public api

  const middleware = Array.isArray(options?.use) ? options?.use ?? [] : [];

  // @ts-ignore
  return useSWR<T>(`${apiBaseUrl}${query}`, fetcher, {
    ...options,
    use: [signatureMiddleware, ...middleware],
  });
};
