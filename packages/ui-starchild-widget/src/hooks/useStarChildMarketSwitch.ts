import { useEffect } from "react";
import type { SymbolsInfo } from "@orderly.network/hooks";

export const useStarChildMarketSwitch = (
  symbol: string,
  symbolsInfoMap: SymbolsInfo,
  onSymbolChange?: (symbol: any) => void,
) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onMarketSwitched = (evt: Event) => {
      const custom = evt as CustomEvent<{ symbol?: string }>;
      const raw =
        typeof custom?.detail?.symbol === "string"
          ? custom.detail.symbol
          : undefined;
      if (!raw) return;

      const [curPrefix, , curQuote] = (symbol || "").split("_");
      const fullKey = raw.includes("_")
        ? raw
        : `${curPrefix || "PERP"}_${raw}_${curQuote || "USDC"}`;

      const getter = (symbolsInfoMap as any)?.[fullKey];
      if (typeof getter !== "function") return;

      const nextInfo = getter();
      if (!nextInfo) return;
      onSymbolChange?.(nextInfo);
    };

    window.addEventListener(
      "starchild:marketSwitched",
      onMarketSwitched as EventListener,
    );
    return () => {
      window.removeEventListener(
        "starchild:marketSwitched",
        onMarketSwitched as EventListener,
      );
    };
  }, [symbol, symbolsInfoMap, onSymbolChange]);
};
