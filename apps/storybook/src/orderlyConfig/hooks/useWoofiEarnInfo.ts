import { useMemo } from "react";
import { useSWR } from "@orderly.network/hooks";

export type WoofiEarnUserData = {
  network: string;
  symbol: string;
  apr: number;
  network_logo: string;
  token_logo: string;
  vault: string;
};

export type WoofiEarnInfoResponse = {
  status: string;
  data: WoofiEarnUserData[];
};

export type SortConfig = {
  key: "apr";
  direction: "asc" | "desc";
};

const URL = "https://api.woofi.com/earn_summary";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWoofiEarnInfo = (sortConfig?: SortConfig | null) => {
  const { data, isLoading, error } = useSWR<WoofiEarnInfoResponse>(
    URL,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const sortedData = useMemo(() => {
    const rows = data?.data || [];
    if (!sortConfig) return rows;

    return [...rows].sort((a, b) => {
      const { key, direction } = sortConfig;
      const valA = a.apr;
      const valB = b.apr;

      return direction === "asc" ? valA - valB : valB - valA;
    });
  }, [data, sortConfig]);

  return {
    data: sortedData,
    isLoading,
    error,
  };
};
