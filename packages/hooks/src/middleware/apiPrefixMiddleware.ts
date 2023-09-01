import { useContext } from "react";
import type { Middleware, SWRHook } from "swr";
import { OrderlyContext } from "../orderlyContext";

export const apiPrefixMiddleware: Middleware = (useSWRNext: SWRHook) => {
  const { apiBaseUrl } = useContext(OrderlyContext);

  return (key, fetcher, config) => {
    // 将日志记录器添加到原始 fetcher。
    const extendedFetcher = (...args) => {
      console.log("SWR apiPrefixMiddleware:", key);
      return fetcher(...args);
    };
    // key =  `${apiBaseUrl}${key}`;

    // 使用新的 fetcher 执行 hook。
    return useSWRNext(key, extendedFetcher, config);
  };
  // return (key, fetcher, config) => {
  //
  //     const { apiBaseUrl } = useContext(OrderlyContext);
  //     const extendedFetcher = async (url: string) => {
  //         console.log("===>>apiPrefix middleware::", key, url);
  //         // if (!url.startsWith("http")){
  //         //     // const apiPrefix = (window as any)[__ORDERLY_API_URL_KEY__];
  //         //     url = `${apiBaseUrl}${url}`;
  //         // }
  //        return fetcher!(url);
  //     };
  //     return useSWRNext(key, extendedFetcher, config);
  // };
};
