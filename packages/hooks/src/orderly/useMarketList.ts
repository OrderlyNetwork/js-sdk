import { useContext, useEffect, useState } from "react";
import { useMarketsStream } from "./useMarketsStream";
import { OrderlyContext } from "../orderlyContext";
import { API, WSMessage } from "@orderly.network/types";
import { SymbolInfo, useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal } from "@orderly.network/utils";

export enum MarketsType {
  FAVORITES,
  RECENT,
  ALL,
}

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

export type TabSort = Record<
  string,
  {
    sortKey: string;
    sortOrder: string;
  }
>;

/*
example data:
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
    "lastSelectFavoriteTab": { "name": "Popular", "id": 1 },
    "tabSort": { "all": { "sortKey": "24h_amount", "sortOrder": "desc" }}        
  }
}
*/
export type MarketsData = {
  favoriteTabs?: FavoriteTab[];
  favorites?: Favorite[];
  recent?: Recent[];
  selectedFavoriteTab?: FavoriteTab;
  tabSort?: TabSort;
};

export type MarketsKey = keyof MarketsData;

export type MarketsItem = {
  symbol: string;
  index_price: number;
  mark_price: number;
  sum_unitary_funding: number;
  est_funding_rate: number;
  last_funding_rate: number;
  next_funding_time: number;
  open_interest: number;
  "24h_open": number;
  "24h_close": number;
  "24h_high": number;
  "24h_low": number;
  "24h_volume": number;
  "24h_amount": number;
  "24h_volumn": number;
  change: number;
  "8h_funding": number;
  quote_dp: number;
  created_time: number;
  openInterest: number;
  isFavorite: boolean;
  leverage?: number;
};

export const MarketsStorageKey = "markets";
export const DefaultFavoriteTab = { name: "Popular", id: 1 };

export const useMarketList = (type: MarketsType) => {
  const { configStore } = useContext(OrderlyContext);

  const { data: futures } = useMarketsStream();
  const symbolsInfo = useSymbolsInfo();

  const getStore = () => {
    const store = configStore.get(MarketsStorageKey) as MarketsData;
    return store || getDefaultStoreData();
  };

  const getStoreByKey = <Key extends MarketsKey>(
    key: Key,
    defaultValue: MarketsData[Key]
  ) => {
    const store = getStore();
    return (store[key] || defaultValue)!;
  };

  const updateStore = (data: MarketsData) => {
    configStore.set(MarketsStorageKey, {
      ...getStore(),
      ...data,
    });
  };

  const getFavoriteTabs = () => {
    return getStoreByKey("favoriteTabs", [{ ...DefaultFavoriteTab }]);
  };

  const getSelectedFavoriteTab = () => {
    return getStoreByKey("selectedFavoriteTab", { ...DefaultFavoriteTab });
  };

  const getFavorites = () => {
    const favs = getStoreByKey("favorites", []);
    const tabs = getFavoriteTabs();
    return filterInvalidTabs(favs, tabs);
  };

  const getRecent = () => {
    return getStoreByKey("recent", []);
  };

  const getTabSort = () => {
    return getStoreByKey("tabSort", {});
  };

  const [markets, setMarkets] = useState<MarketsItem[]>([]);

  const [favoriteTabs, setFavoriteTabs] = useState(getFavoriteTabs);
  const [selectedFavoriteTab, setSelectedFavoriteTab] = useState(
    getSelectedFavoriteTab
  );
  const [favorites, setFavorites] = useState(getFavorites);
  const [recent, setRecent] = useState(getRecent);

  const [tabSort, setTabSort] = useState(getTabSort);

  const updateFavoriteTabs = (
    tab: FavoriteTab | FavoriteTab[],
    operator?: {
      add?: boolean;
      update?: boolean;
      delete?: boolean;
    }
  ) => {
    const tabs = updateTabs(favoriteTabs, tab, operator);
    setFavoriteTabs(tabs);
  };

  const updateSymbolFavoriteState = (
    symbol: API.MarketInfoExt,
    tab: FavoriteTab | FavoriteTab[],
    remove: boolean = false
  ) => {
    const list = updateSymbolFavorite({ favorites, symbol, tab, remove });
    setFavorites(list);
  };

  const addToHistory = (symbol: API.MarketInfoExt) => {
    const list = addToTop(recent, symbol);
    setRecent(list);
  };

  const pinToTop = (symbol: API.MarketInfoExt) => {
    const newList = moveToTop(favorites, symbol);
    if (newList) {
      setFavorites(newList);
    }
  };

  const updateTabsSortState = (
    tabId: string,
    sortKey: string,
    sortOrder: "desc" | "asc"
  ) => {
    const map = getStoreByKey("tabSort", {});

    map[tabId] = {
      sortKey,
      sortOrder,
    };

    setTabSort(map);
  };

  useEffect(() => {
    updateStore({
      favoriteTabs,
      favorites,
      recent,
      tabSort,
      selectedFavoriteTab,
    });
  }, [favoriteTabs, favorites, recent, tabSort, selectedFavoriteTab]);

  useEffect(() => {
    const markets = addFieldToMarkets(futures, symbolsInfo);
    const filterList = filterMarkets({ markets, favorites, recent, type });
    setMarkets(filterList);
  }, [futures, symbolsInfo, favorites, recent, type]);

  return [
    markets,
    {
      favoriteTabs,
      favorites,
      recent,
      tabSort,
      selectedFavoriteTab,
      updateFavorites: setFavorites,
      updateFavoriteTabs,
      updateSymbolFavoriteState,
      pinToTop,
      addToHistory,
      updateSelectedFavoriteTab: setSelectedFavoriteTab,
      updateTabsSortState,
    },
  ] as const;
};

const addFieldToMarkets = (
  futures: WSMessage.Ticker[] | null,
  symbolsInfo: SymbolInfo
) => {
  return (futures || [])?.map((item: any) => {
    const info = symbolsInfo[item.symbol];

    return {
      ...item,
      quote_dp: info("quote_dp"),
      created_time: info("created_time"),
      leverage: getLeverage(info("base_imr")),
      openInterest: getOpenInterest(item.open_interest, item.index_price),
      "8h_funding": get8hFunding(item.est_funding_rate, info("funding_period")),
      change: get24hChange({
        change: item.change,
        close: item["24h_close"],
        open: item["24h_open"],
      }),
    } as MarketsItem;
  });
};

const filterMarkets = (params: {
  markets: MarketsItem[];
  favorites: Favorite[];
  recent: Recent[];
  type: MarketsType;
}) => {
  const { markets, favorites, recent, type } = params;
  let curData: MarketsItem[] = [];
  if (type === MarketsType.ALL) {
    curData = markets;
  } else {
    const storageData = type === MarketsType.FAVORITES ? favorites : recent;

    const keys = storageData.map((item) => item.name);

    curData = markets?.filter((item) => keys.includes(item.symbol));
  }

  const favoriteKeys = favorites.map((item) => item.name);

  return curData?.map((item) => ({
    ...item,
    isFavorite:
      type == MarketsType.FAVORITES ? true : favoriteKeys.includes(item.symbol),
  }));
};

function get8hFunding(est_funding_rate: number, funding_period: number) {
  let funding8h = 0;

  if (est_funding_rate === undefined || est_funding_rate === null) {
    return null;
  }

  if (funding_period) {
    funding8h = new Decimal(est_funding_rate || 0)
      .mul(funding_period)
      .div(8)
      .toNumber();
  }

  return funding8h;
}

function get24hChange(params: { change: number; close: number; open: number }) {
  const { change, close, open } = params;

  if (change !== undefined) {
    return change;
  }

  if (close !== undefined && open !== undefined) {
    if (open === 0) {
      return 0;
    }
    return new Decimal(close).minus(open).div(open).toNumber();
  }
}

function getLeverage(base_imr: number) {
  return base_imr ? 1 / base_imr : undefined;
}

function getOpenInterest(open_interest?: number, index_price?: number) {
  return new Decimal(open_interest || 0).mul(index_price || 0).toNumber();
}

function getDefaultStoreData() {
  return {
    recent: [],
    favorites: [
      { name: "PERP_ETH_USDC", tabs: [{ ...DefaultFavoriteTab }] },
      { name: "PERP_BTC_USDC", tabs: [{ ...DefaultFavoriteTab }] },
    ],
    favoriteTabs: [{ ...DefaultFavoriteTab }],
    lastSelectedFavoriteTab: { ...DefaultFavoriteTab },
    tabSort: {},
  } as MarketsData;
}

function filterInvalidTabs(favorites: Favorite[], tabs: FavoriteTab[]) {
  return favorites
    .map((favorite) => {
      return {
        ...favorite,
        tabs: favorite.tabs.filter(
          (tab) => !!tabs.find((item) => item.id === tab.id)
        ),
      };
    })
    .filter((item) => !!item.tabs.length);
}

export function updateTabs(
  favoriteTabs: FavoriteTab[],
  tab: FavoriteTab | FavoriteTab[],
  operator?: {
    add?: boolean;
    update?: boolean;
    delete?: boolean;
  }
) {
  if (Array.isArray(tab)) {
    return tab;
  }

  const tabs = [...favoriteTabs];
  const index = tabs.findIndex((item) => item.id === tab.id);

  if (operator?.add) {
    tabs.push(tab);
  } else if (operator?.update && index !== -1) {
    tabs[index] = tab;
  } else if (operator?.delete && index !== -1) {
    tabs.splice(index, 1);
  }

  return tabs;
}

function addToTop(recent: Recent[], symbol: API.MarketInfoExt) {
  const list = [...recent];
  const index = list.findIndex((item) => item.name == symbol.symbol);
  if (index !== -1) {
    list.splice(index, 1);
  }
  list.unshift({ name: symbol.symbol });
  return list;
}

function moveToTop(favorites: Favorite[], symbol: API.MarketInfoExt) {
  const index = favorites.findIndex((item) => item.name === symbol.symbol);
  if (index !== -1) {
    const item = favorites[index];
    const list = [...favorites];
    list.splice(index, 1);
    list.unshift(item);
    return list;
  }
}

/**
 * if tab is arrary, the remove params is not work
 * if tab is empty array, will be delete, otherwise will be override
 */
function updateSymbolFavorite(params: {
  favorites: Favorite[];
  tab: FavoriteTab | FavoriteTab[];
  symbol: API.MarketInfoExt;
  remove: boolean;
}) {
  const { favorites, symbol, tab, remove = false } = params;

  const list = [...favorites];
  const index = list.findIndex((item) => item.name == symbol.symbol);

  const tabs = Array.isArray(tab) ? tab : [tab];

  // can not find
  if (index === -1) {
    if (tabs.length && !remove) {
      // insert
      list.unshift({ name: symbol.symbol, tabs });
    }
  } else {
    const favorite = list[index];
    if (Array.isArray(tab)) {
      if (!tab.length) {
        // remove
        list.splice(index, 1);
      } else {
        // update
        list[index] = { ...favorite, tabs: tab };
      }
    } else {
      if (remove) {
        const tabs = favorite.tabs.filter((item) => item.id != tab.id);
        if (!tabs.length) {
          // remove
          list.splice(index, 1);
        } else {
          // update
          list[index] = { ...favorite, tabs };
        }
      } else {
        // insert
        list[index] = { ...favorite, tabs: [...favorite.tabs, tab] };
      }
    }
  }

  return list;
}
