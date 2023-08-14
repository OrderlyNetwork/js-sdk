import { useContext } from "react";

import useSWRInfinite, { type SWRInfiniteKeyLoader, type SWRInfiniteConfiguration } from "swr/infinite";
// import { apiPrefixMiddleware } from "./middleware/apiPrefixMiddleware";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { OrderlyContext } from "./orderlyContext";
import {get} from "@orderly/net";

const fetcher = (url: string, init: RequestInit) => get(url, init);

export const usePrivateInfiniteQuery = (
  getKey: SWRInfiniteKeyLoader,
  options?: SWRInfiniteConfiguration
) => {
  const middleware = Array.isArray(options?.use) ? options?.use ?? [] : [];
  const { apiBaseUrl } = useContext(OrderlyContext);

  const result = useSWRInfinite((index,prevData)=>`${apiBaseUrl}${getKey(index,prevData)}`,fetcher, {
    ...options,
    use: [signatureMiddleware,...middleware],
  });

  return result;
};
