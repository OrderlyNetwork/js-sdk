import { useCallback, useMemo } from "react";
import {
  useMarkets,
  MarketsType,
  useLocalStorage,
} from "@kodiak-finance/orderly-hooks";
import { API } from "@kodiak-finance/orderly-types";
import {
  SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  SIDE_MARKETS_SEL_TAB_KEY,
} from "../../constant";
import { MarketsTabName } from "../../type";
import { sortList } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { useTabSort } from "../shared/hooks/useTabSort";

export type MarketType = "all" | "recent" | "newListing" | "favorites";

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
  const {
    symbols: optionSymbols,
    maxItems: optionMaxItems,
    defaultMarketType,
  } = options || {};
  const { symbol: currentSymbol, onSymbolChange } = useMarketsContext();
  const [selectedMarketType, setSelectedMarketType] =
    useLocalStorage<MarketType>(
      SIDE_MARKETS_SEL_TAB_KEY,
      (defaultMarketType || "all") as MarketType,
    );

  const MarketsTypeMap: Record<MarketType, MarketsType> = {
    all: MarketsType.ALL,
    recent: MarketsType.RECENT,
    newListing: MarketsType.NEW_LISTING,
    favorites: MarketsType.FAVORITES,
  };

  // Pull markets from the shared store (same as SideMarkets)
  const marketTypeKey = (selectedMarketType as MarketType) || "all";
  const [markets, favorite] = useMarkets(
    MarketsTypeMap[marketTypeKey] || MarketsType.ALL,
  );
  // Apply the same ordering rules as SideMarkets
  const filteredMarkets = useMemo(() => {
    if (selectedMarketType === "favorites") {
      const { favorites, selectedFavoriteTab } = favorite;
      const symbolsInTab = favorites
        ?.filter((fav) =>
          fav.tabs?.some((tab) => tab.id === selectedFavoriteTab.id),
        )
        ?.map((fav) => fav.name);

      const map: Record<string, (typeof markets)[number]> = Object.create(null);
      for (const m of markets) map[m.symbol] = m;
      return (symbolsInTab || [])
        .map((s) => map[s])
        .filter(Boolean) as typeof markets;
    }

    if (selectedMarketType === "recent") {
      const symbolsInRecent = favorite.recent?.map((r) => r.name) || [];
      const map: Record<string, (typeof markets)[number]> = Object.create(null);
      for (const m of markets) map[m.symbol] = m;
      return symbolsInRecent
        .map((s) => map[s])
        .filter(Boolean) as typeof markets;
    }

    return markets;
  }, [
    markets,
    favorite.favorites,
    favorite.selectedFavoriteTab,
    favorite.recent,
    selectedMarketType,
  ]);

  // Read the tabSort from the same storage used by side markets and apply it
  const { tabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });
  const sortedMarkets = useMemo(() => {
    const sort = tabSort?.[selectedMarketType as MarketsTabName];
    return sort ? sortList(filteredMarkets, sort) : filteredMarkets;
  }, [filteredMarkets, tabSort, selectedMarketType]);

  const symbols = useMemo(() => {
    const list = optionSymbols
      ? optionSymbols
      : sortedMarkets.map((m) => m.symbol);
    const max = optionMaxItems;
    if (typeof max === "number") {
      if (max === -1) return list;
      if (max >= 0) return list.slice(0, max);
    }
    return list;
  }, [sortedMarkets, optionSymbols, optionMaxItems]);

  type TickerData = Record<
    string,
    { "24h_close": number; change: number; quote_dp: number }
  >;
  const tickerData = useMemo<TickerData>(() => {
    return sortedMarkets.reduce<TickerData>((acc, item) => {
      acc[item.symbol] = {
        "24h_close": item["24h_close"],
        change: item.change,
        quote_dp: item.quote_dp,
      };
      return acc;
    }, {} as TickerData);
  }, [sortedMarkets]);

  const onSymbolClick = useCallback(
    (symbol: string) => {
      const record = sortedMarkets.find((m) => m.symbol === symbol);
      if (record) {
        onSymbolChange?.(record as any);
        favorite.addToHistory(record as any);
      } else {
        onSymbolChange?.({ symbol } as API.Symbol);
      }
    },
    [sortedMarkets, favorite, onSymbolChange],
  );

  const onMarketTypeChange = useCallback(
    (marketType: MarketType) => {
      setSelectedMarketType(marketType);
    },
    [setSelectedMarketType],
  );

  return {
    symbols,
    tickerData,
    currentSymbol,
    onSymbolClick,
    selectedMarketType,
    onMarketTypeChange,
  } as const;
};
