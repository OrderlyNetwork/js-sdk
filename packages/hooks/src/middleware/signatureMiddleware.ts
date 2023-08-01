import { SWRHook, Middleware } from "swr";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    const extendedFetcher = (args: any) => {
      console.log("signature middleware::", key, args);

      // @ts-ignore
      return fetcher(args);
    };
    return useSWRNext(key, extendedFetcher, config);
  };
};
