import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { signatureMiddleware } from "./middleware/signatureMiddleware";

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const usePrivateQuery = <T>(
  query: string,
  options?: SWRConfiguration
): SWRResponse<T> => {
  // check the query is public api

  const middleware = Array.isArray(options?.use) ? options?.use ?? [] : [];
  middleware.push(signatureMiddleware);

  return useSWR<T>(query, {
    ...options,
    use: middleware,
  });
};
