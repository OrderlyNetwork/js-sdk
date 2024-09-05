import { useSymbolsInfo } from "./orderlyHooks";

export const useSymbolInfo = (symbol: string) => {
  if (!symbol) {
    throw new Error("symbol is required and must be a string");
  }

  const infos = useSymbolsInfo();

  return infos.isNil ? null : infos[symbol];
};
