import { useMemo } from "react";
import { useSymbolsInfo, useTickerStream } from "@kodiak-finance/orderly-hooks";

export type UseSymbolInfoBarScriptOptions = {
  symbol: string;
};

export type UseSymbolInfoBarScriptReturn = ReturnType<
  typeof useSymbolInfoBarScript
>;

export function useSymbolInfoBarScript(options: UseSymbolInfoBarScriptOptions) {
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
