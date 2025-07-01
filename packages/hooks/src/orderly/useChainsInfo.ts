import type { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";

export const useChainsInfo = () => {
  return useQuery<API.Chain[]>(`/v1/public/token`, {
    errorRetryCount: 3,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    dedupingInterval: 3_600_000,
  });
};
