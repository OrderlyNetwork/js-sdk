import { useMemo } from "react";
import { useQuery } from "../useQuery";
import { useAccountInfo } from "./useAccountInfo";

export const useSymbolLeverage = (symbol: string) : number | "-" => {
  const { data: info } = useAccountInfo();

  const maxAccountLeverage = info?.max_leverage;

  const res = useQuery<any>(`/v1/public/info/${symbol}`, {
    dedupingInterval: 1000 * 60 * 60 * 24,
    revalidateOnFocus: false,
    errorRetryCount: 2,
    errorRetryInterval: 200,
  });

  const maxSymbolLeverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
  }, [res]);

  const maxLeverage = useMemo(() => {
    if (!maxAccountLeverage || !maxSymbolLeverage) {
      return "-";
    }

    return Math.min(maxAccountLeverage, maxSymbolLeverage);
  }, [maxAccountLeverage, maxSymbolLeverage]);

  return maxLeverage;
};
