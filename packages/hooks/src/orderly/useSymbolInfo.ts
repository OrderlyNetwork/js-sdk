import { SDKError } from "@orderly.network/types";
import { useSymbolsInfo } from "./orderlyHooks";

export const useSymbolInfo = (symbol: string) => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }

  const infos = useSymbolsInfo();

  return infos.isNil ? null : infos[symbol];
};
