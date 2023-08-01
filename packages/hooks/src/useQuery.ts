import useSWR, { SWRConfiguration, SWRResponse } from "swr";

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
  // check the query is public api
  if (!query.startsWith("/public")) {
    throw new Error("useQuery is only for public api");
  }
  return useSWR<T>(query, options);
};
