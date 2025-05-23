import { useMemo } from "react";
import { type API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";
import { useAppStore } from "./appStore";

export type SymbolInfo = ReturnType<typeof useSymbolsInfo>;

export const useSymbolsInfo = () => {
  // const { data } = useQuery<Record<string, API.SymbolExt>>(`/v1/public/info`, {
  //   focusThrottleInterval: 1000 * 60 * 60 * 24,
  //   dedupingInterval: 1000 * 60 * 60 * 24,
  //   revalidateOnFocus: false,
  //   formatter(data: { rows: API.Symbol[] }) {
  //     if (!data?.rows || !data?.rows?.length) {
  //       return {};
  //     }
  //     const obj = Object.create(null);

  //     for (let index = 0; index < data.rows.length; index++) {
  //       const item = data.rows[index];
  //       const arr = item.symbol.split("_");
  //       const base_dp = getPrecisionByNumber(item.base_tick);
  //       const quote_dp = getPrecisionByNumber(item.quote_tick);
  //       obj[item.symbol] = {
  //         ...item,
  //         base_dp,
  //         quote_dp,
  //         base: arr[1],
  //         quote: arr[2],
  //         type: arr[0],
  //         name: `${arr[1]}-${arr[0]}`,
  //       };
  //     }

  //     return obj;
  //   },
  // });
  const symbolsInfo = useAppStore((state) => state.symbolsInfo);

  return useMemo(
    () => createGetter<API.SymbolExt, string>({ ...symbolsInfo }),
    [symbolsInfo],
  );
};

export const useSymbolsInfoStore = () => {
  return useAppStore((state) => state.symbolsInfo);
};
