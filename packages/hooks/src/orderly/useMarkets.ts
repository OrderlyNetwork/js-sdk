import { useContext, useMemo, useState } from "react";
import { useMarketsStream } from "./useMarketsStream";
import { OrderlyContext } from "../orderlyContext";
import { API } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { useFundingRates } from "./useFundingRates";
import { Decimal } from "@orderly.network/utils";

export enum MarketsType {
  FAVORITES,
  RECENT,
  ALL,
}

/*
{
    markets: {
        recent: [
            { "name": `${symbol.name}` },
            { "name": `${symbol.name}` },
        ],
        favorites: [
            { "name": `${symbol.name}`, "tabs": [{ "name": "Popular", "id": 1 }] },
        ],
        favoriteTabs: [
            { "name": "Popular", "id": 1 },
        ],
        "lastSelectFavoriteTab": { "name": "Popular", "id": 1 }
        
    }
}
*/

export interface FavoriteTab {
  name: string;
  id: number;
}

export interface Favorite {
  name: string;
  tabs: FavoriteTab[];
}

export interface Recent {
  name: string;
}

export interface TabSort {
  sortKey: string;
  sortOrder: string;
}

export const useMarkets = (type: MarketsType) => {
  const marketsKey = "markets";
  const symbolsInfo = useSymbolsInfo();

  const fundingRates = useFundingRates();

  const { data: futures } = useMarketsStream();
  const { configStore } = useContext(OrderlyContext);

  const updateStore = (data: Record<string, any>) => {
    configStore.set(marketsKey, {
      ...configStore.getOr(marketsKey, {}),
      ...data,
    });
  };

  const getStore = <T>(key: string, defaultValue: T) => {
    return (configStore.get(marketsKey)[key as any] as T) || defaultValue;
  };

  // {"PERP_ETH_USDC": {}, ...}

  if (!configStore.get(marketsKey)) {
    const jsonStr = localStorage.getItem(marketsKey);
    if (jsonStr) {
      configStore.set(marketsKey, JSON.parse(jsonStr));
    } else {
      const defaultTab = { name: "Popular", id: 1 };
      configStore.set(marketsKey, {
        recent: [],
        favorites: [
          { name: "PERP_ETH_USDC", tabs: [{ ...defaultTab }] },
          { name: "PERP_BTC_USDC", tabs: [{ ...defaultTab }] },
        ],
        favoriteTabs: [{ ...defaultTab }],
        lastSelectedFavoriteTab: { ...defaultTab },
      });
    }
  }

  const getFavoriteTabs = useMemo(() => {
    // @ts-ignore
    const tabs = configStore.get(marketsKey)["favoriteTabs"];
    return (tabs || [{ name: "Popular", id: 1 }]) as FavoriteTab[];
  }, []);

  const getFavorites = useMemo(() => {
    // @ts-ignore
    const curData = (configStore.get(marketsKey)["favorites"] ||
      []) as Favorite[];
    const tabs = getFavoriteTabs;
    const result = [] as Favorite[];
    for (let index = 0; index < curData.length; index++) {
      const favData = curData[index];
      var favTabs = favData.tabs.filter(
        (tab) => tabs.findIndex((item) => tab.id === item.id) !== -1
      );
      if (favTabs.length > 0) {
        result.push({ ...favData, tabs: favTabs });
      }
    }
    configStore.set(marketsKey, {
      ...configStore.getOr(marketsKey, {}),
      favorites: result,
    });
    // localStorage.setItem(marketsKey, JSON.stringify(configStore.get(marketsKey)));

    return result;
  }, [configStore]);

  const getRecent = useMemo(() => {
    // @ts-ignore
    const curData = configStore.get(marketsKey)["recent"];
    return ((curData || []) as Recent[]).filter((e) => e);
  }, []);

  const [favoriteTabs, setFavoriteTabs] = useState(getFavoriteTabs);
  const [favorites, setFavorites] = useState(getFavorites);
  const [recent, setRecent] = useState(getRecent);
  const [tabSort, setTabSort] = useState(
    getStore<Record<string, TabSort>>("tabSort", {})
  );

  const updateFavoriteTabs = (
    tab: FavoriteTab | FavoriteTab[],
    operator?: {
      add?: boolean;
      update?: boolean;
      delete?: boolean;
    }
  ) => {
    const saveTabs = (tabs: FavoriteTab[]) => {
      setFavoriteTabs(tabs);
      configStore.set(marketsKey, {
        ...configStore.getOr(marketsKey, {}),
        favoriteTabs: tabs,
      });
    };

    if (Array.isArray(tab)) {
      saveTabs(tab);
      return;
    }

    var tabs = [...favoriteTabs];
    const index = tabs.findIndex((item) => item.id === tab.id);
    if (operator?.add) {
      tabs.push(tab);
    } else if (operator?.update) {
      if (index !== -1) {
        tabs[index] = tab;
      }
    } else if (operator?.delete) {
      if (index !== -1) {
        tabs.splice(index, 1);
      }
    }
    saveTabs(tabs);
  };

  const updateFavorites = (favorites: Favorite[]) => {
    updateStore({
      favorites,
    });
    setFavorites(favorites);
  };

  const setRecentData = (symbol: API.MarketInfoExt) => {
    const curData = [...recent];
    const index = curData.findIndex((item) => item.name == symbol.symbol);
    if (index !== -1) {
      curData.splice(index, 1);
    }
    curData.unshift({ name: symbol.symbol });
    configStore.set(marketsKey, {
      ...configStore.getOr(marketsKey, {}),
      recent: curData,
    });
    setRecent(curData);
  };

  const setFavoritesData = (
    symbol: API.MarketInfoExt,
    tab: FavoriteTab | FavoriteTab[],
    remove: boolean = false
  ) => {
    const curData = [...favorites];
    const index = curData.findIndex((item) => item.name == symbol.symbol);

    if (index === -1) {
      // can not find
      if (Array.isArray(tab)) {
        if (tab.length > 0) {
          curData.unshift({ name: symbol.symbol, tabs: tab });
        }
      } else {
        if (!remove) {
          // insert
          curData.unshift({ name: symbol.symbol, tabs: [tab] });
        }
      }
    } else {
      const favorite = curData[index];
      if (Array.isArray(tab)) {
        if (tab.length === 0) {
          // remove
          curData.splice(index, 1);
        } else {
          // overrides
          curData[index] = { ...favorite, tabs: tab };
        }
      } else {
        if (remove) {
          const tabs = favorite.tabs.filter((tab) => tab.id != tab.id);
          if (tabs.length === 0) {
            // del favorite
            curData.splice(index, 1);
          } else {
            curData[index] = { ...favorite, tabs };
          }
        } else {
          // insert
          const tabs = favorite.tabs;
          tabs.push(tab);
          curData[index] = { ...favorite, tabs };
        }
      }
    }

    configStore.set(marketsKey, {
      ...configStore.getOr(marketsKey, {}),
      favorites: curData,
    });
    setFavorites(() => curData);
  };

  const marketsList = useMemo(() => {
    const list = futures?.map((item: any) => {
      const { open_interest = 0, index_price = 0 } = item;

      const info = symbolsInfo[item.symbol];
      const rate = fundingRates[item.symbol];
      const est_funding_rate = rate("est_funding_rate", 0);
      const funding_period = info("funding_period");

      return {
        ...item,
        "8h_funding": get8hFunding(est_funding_rate, funding_period),
        quote_dp: info("quote_dp"),
        created_time: info("created_time"),
        openInterest: new Decimal(open_interest).mul(index_price).toNumber(),
      };
    });
    return list || [];
  }, [symbolsInfo, futures, fundingRates]);

  const getData = (type: MarketsType) => {
    // get data
    const localData =
      type === MarketsType.FAVORITES ? [...favorites] : [...recent];
    // filter
    const keys = localData.map((item) => item.name);
    const filter =
      type == MarketsType.ALL
        ? marketsList
        : marketsList?.filter((item) => keys.includes(item.symbol));

    const favoritesData = [...favorites];
    const favoriteKeys = favoritesData.map((item) => item.name);
    if (filter) {
      for (let index = 0; index < filter.length; index++) {
        const element = filter[index];
        const isFavorite =
          type == MarketsType.FAVORITES
            ? true
            : favoriteKeys.includes(element.symbol);

        const fIndex = favoritesData.findIndex(
          (item) => item.name === element.symbol
        );
        const tabs = fIndex === -1 ? [] : favoritesData[fIndex].tabs;

        let imr = undefined;
        if (symbolsInfo) {
          imr = symbolsInfo?.[element.symbol]("base_imr");
        }

        filter[index] = {
          ...filter[index],
          // @ts-ignore
          isFavorite,
          tabs,
          leverage: imr ? 1 / imr : undefined,
        };
      }
    }

    return filter;
  };

  const addToHistory = (symbol: API.MarketInfoExt) => {
    setRecentData(symbol);
  };

  const updateSymbolFavoriteState = (
    symbol: API.MarketInfoExt,
    tab: FavoriteTab | FavoriteTab[],
    del: boolean = false
  ) => {
    setFavoritesData(symbol, tab, del);
  };

  const markets = getData(type);

  const pinToTop = (symbol: API.MarketInfoExt) => {
    const index = favorites.findIndex((item) => item.name === symbol.symbol);
    if (index !== -1) {
      const element = favorites[index];
      const list = [...favorites];
      list.splice(index, 1);
      list.unshift(element);

      configStore.set(marketsKey, {
        ...configStore.getOr(marketsKey, {}),
        favorites: list,
      });
      setFavorites(list);
    }
  };

  const getLastSelFavTab = () => {
    // @ts-ignore
    const curData = configStore.get(marketsKey)["lastSelectedFavoriteTab"];
    return (curData || { name: "Popular", id: 1 }) as FavoriteTab;
  };

  const updateSelectedFavoriteTab = (tab: FavoriteTab) => {
    configStore.set(marketsKey, {
      ...configStore.getOr(marketsKey, {}),
      lastSelectedFavoriteTab: tab,
    });
  };

  const updateTabsSortState = (
    tabId: string,
    sortKey: string,
    sortOrder: "desc" | "asc"
  ) => {
    const map = getStore<Record<string, TabSort>>("tabSort", {});

    map[tabId] = {
      sortKey,
      sortOrder,
    };

    updateStore({ tabSort: map });
    setTabSort(map);
  };

  return [
    markets || [],
    {
      favoriteTabs,
      favorites,
      recent,
      tabSort,
      addToHistory,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
      pinToTop,
      getLastSelFavTab,
      updateSelectedFavoriteTab,
      updateTabsSortState,
      updateFavorites,
    },
  ] as const;
};

function get8hFunding(est_funding_rate: number, funding_period: number) {
  let funding8h = 0;

  if (funding_period) {
    funding8h = new Decimal(est_funding_rate)
      .mul(funding_period)
      .div(8)
      .toNumber();
  }

  return funding8h;
}
