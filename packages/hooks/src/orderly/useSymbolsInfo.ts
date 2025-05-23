import { useMemo } from "react";
import type { API } from "@orderly.network/types";
import { createGetter } from "../utils/createGetter";
import { useAppStore } from "./appStore";

export type SymbolInfo = ReturnType<typeof useSymbolsInfo>;

export const useSymbolsInfo = () => {
  const symbolsInfo = useAppStore((state) => state.symbolsInfo);
  return useMemo(
    () => createGetter<API.SymbolExt, string>({ ...symbolsInfo }),
    [symbolsInfo],
  );
};

export const useSymbolsInfoStore = () => {
  return useAppStore((state) => state.symbolsInfo);
};
