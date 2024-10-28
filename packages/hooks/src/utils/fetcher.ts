import { get } from "@orderly.network/net";
import { type SWRConfiguration } from "swr";

export const fetcher = (
  url: string,
  init: RequestInit = {},
  queryOptions: useQueryOptions<any>
) => get(url, init, queryOptions?.formatter);

export type useQueryOptions<T> = SWRConfiguration & {
  formatter?: (data: any) => T;
};

// export const onErrorRetry:SWRConfiguration['onErrorRetry'] = (error, key, config, revalidate, { retryCount })=>{
// // if(error.status === 5)
// if(retryCount >= 5) return ;

// }
