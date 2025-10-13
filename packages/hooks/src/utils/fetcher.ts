import type { SWRConfiguration } from "swr";
import { get } from "@kodiak-finance/orderly-net";

export const fetcher = (
  url: string,
  init: RequestInit = {},
  queryOptions: useQueryOptions<any>,
) => get(url, init, queryOptions?.formatter);

export type useQueryOptions<T> = SWRConfiguration & {
  formatter?: (data: any) => T;
};

export const noCacheConfig: SWRConfiguration = {
  dedupingInterval: 0,
  revalidateOnMount: true,
  revalidateIfStale: true,
};
