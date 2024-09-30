import { useMemo } from "react";
import { useSymbolsInfo, useTickerStream } from "@orderly.network/hooks";

export type UseTokenInfoBarScriptOptions = {
  symbol: string;
};

export type UseTokenInfoBarScriptReturn = ReturnType<
  typeof useTokenInfoBarScript
>;

export function useTokenInfoBarScript(options: UseTokenInfoBarScriptOptions) {
  const { symbol } = options;

  const data = useTickerStream(symbol);

  const symbolsInfo = useSymbolsInfo();

  const leverage = useMemo(() => {
    const info = symbolsInfo[symbol];
    const baseImr = info("base_imr");
    return getLeverage(baseImr);
  }, [symbol, symbolsInfo]);

  return {
    symbol,
    data,
    leverage,
  };
}

function getLeverage(base_imr: number) {
  return base_imr ? 1 / base_imr : undefined;
}
