import { useMemo } from "react";
import { useMarketsContext } from "../marketsProvider";

export const useEXchanges = () => {
  const { comparisonProps } = useMarketsContext();
  const brokerName = comparisonProps?.exchangesName || "Orderly";
  const brokerIconSrc = comparisonProps?.exchangesIconSrc;
  const exchanges = useMemo<string[]>(() => {
    return [
      brokerName,
      "Binance",
      `${brokerName} - Binance`,
      "OKX",
      `${brokerName} - OKX`,
      "Bybit",
      `${brokerName} - Bybit`,
      "dYdX",
      `${brokerName} - dYdX`,
      "Bitget",
      `${brokerName} - Bitget`,
      "KuCoin",
      `${brokerName} - KuCoin`,
    ];
  }, [comparisonProps?.exchangesName]);
  return { exchanges, brokerName, brokerIconSrc };
};
