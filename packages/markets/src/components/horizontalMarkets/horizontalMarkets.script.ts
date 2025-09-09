import { useCallback, useMemo, useState } from "react";
import { useTickerStream } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useMarketsContext } from "../marketsProvider";

export type MarketType =
  | "all"
  | "recent"
  | "newListing"
  | "favorites"
  | "trending";

export type HorizontalMarketsScriptOptions = {
  symbols?: string[];
  maxItems?: number;
  defaultMarketType?: MarketType;
};

export type HorizontalMarketsScriptReturn = ReturnType<
  typeof useHorizontalMarketsScript
>;

export const useHorizontalMarketsScript = (
  options?: HorizontalMarketsScriptOptions,
) => {
  const { symbol: currentSymbol, onSymbolChange } = useMarketsContext();
  const [selectedMarketType, setSelectedMarketType] = useState<MarketType>(
    options?.defaultMarketType || "all",
  );

  // Mock data for different market types
  const mockSymbolsByType = useMemo(() => {
    const allSymbols = [
      "PERP_BTC_USDC",
      "PERP_ETH_USDC",
      "PERP_SOL_USDC",
      "PERP_AVAX_USDC",
      "PERP_BNB_USDC",
      "PERP_ADA_USDC",
      "PERP_DOT_USDC",
      "PERP_LINK_USDC",
      "PERP_UNI_USDC",
      "PERP_LTC_USDC",
      "PERP_MATIC_USDC",
      "PERP_ATOM_USDC",
      "PERP_FIL_USDC",
      "PERP_NEAR_USDC",
      "PERP_ALGO_USDC",
    ];

    return {
      all: allSymbols,
      recent: [
        "PERP_BTC_USDC",
        "PERP_ETH_USDC",
        "PERP_SOL_USDC",
        "PERP_AVAX_USDC",
        "PERP_BNB_USDC",
      ],
      newListing: ["PERP_MATIC_USDC", "PERP_ATOM_USDC", "PERP_FIL_USDC"],
      favorites: [
        "PERP_BTC_USDC",
        "PERP_ETH_USDC",
        "PERP_SOL_USDC",
        "PERP_AVAX_USDC",
      ],
      trending: [
        "PERP_BTC_USDC",
        "PERP_ETH_USDC",
        "PERP_SOL_USDC",
        "PERP_AVAX_USDC",
        "PERP_BNB_USDC",
        "PERP_ADA_USDC",
      ],
    };
  }, []);

  // Get symbols based on selected market type
  const mockSymbols = useMemo(() => {
    const symbols =
      mockSymbolsByType[selectedMarketType] || mockSymbolsByType.all;
    return options?.symbols || symbols.slice(0, options?.maxItems || 10);
  }, [
    selectedMarketType,
    mockSymbolsByType,
    options?.symbols,
    options?.maxItems,
  ]);

  // Mock ticker data for each symbol
  const mockTickerData = useMemo(() => {
    return mockSymbols.reduce(
      (acc, symbol) => {
        acc[symbol] = {
          symbol,
          "24h_close": Math.random() * 100000 + 1000,
          change: (Math.random() - 0.5) * 0.2, // -10% to +10%
          "24h_amount": Math.random() * 1000000 + 100000,
          leverage: Math.floor(Math.random() * 50) + 1,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [mockSymbols]);

  const onSymbolClick = useCallback(
    (symbol: string) => {
      if (onSymbolChange) {
        // Follow the same pattern as other components in the codebase
        onSymbolChange({ symbol } as API.Symbol);
      }
    },
    [onSymbolChange],
  );

  const onMarketTypeChange = useCallback((marketType: MarketType) => {
    setSelectedMarketType(marketType);
  }, []);

  return {
    symbols: mockSymbols,
    tickerData: mockTickerData,
    currentSymbol,
    onSymbolClick,
    selectedMarketType,
    onMarketTypeChange,
  } as const;
};
