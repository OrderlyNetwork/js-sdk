import { get } from "@orderly/net";
import { type SWRConfiguration } from "swr";

export const fetcher = (
  url: string,
  init: RequestInit = {},
  queryOptions: useQueryOptions<any>
) => get(url, init, queryOptions?.formatter);

export type useQueryOptions<T> = SWRConfiguration & {
  formatter?: (data: any) => T;
};
