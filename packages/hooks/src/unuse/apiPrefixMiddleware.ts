import { useContext } from "react";
import type { Middleware, SWRHook } from "swr";
import { OrderlyContext } from "../orderlyContext";

export const apiPrefixMiddleware: Middleware = (useSWRNext: SWRHook) => {
  // @ts-ignore
  const { apiBaseUrl } = useContext(OrderlyContext);

  return (key, fetcher, config) => {
    const extendedFetcher = (...args: any[]) => {
      // @ts-ignore
      return fetcher(...args);
    };
    // key =  `${apiBaseUrl}${key}`;

    return useSWRNext(key, extendedFetcher, config);
  };
  // return (key, fetcher, config) => {
  //
  //     const { apiBaseUrl } = useContext(OrderlyContext);
  //     const extendedFetcher = async (url: string) => {
  //
  //         // if (!url.startsWith("http")){
  //         //     // const apiPrefix = (window as any)[__ORDERLY_API_URL_KEY__];
  //         //     url = `${apiBaseUrl}${url}`;
  //         // }
  //        return fetcher!(url);
  //     };
  //     return useSWRNext(key, extendedFetcher, config);
  // };
};
