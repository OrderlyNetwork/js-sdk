import { useCallback, useContext, useMemo, useState } from "react";
import { useMarketsStream } from "./useMarketsStream";
import { useConfig } from "../useConfig";
import { OrderlyContext } from "../orderlyContext";
import { API } from "@orderly.network/types";

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
            { "name": `${symbol.name}`, "tabs": ["a", "b"] },
        ],
        favoriteTabs: [
            { "name": "Popular", "id": 1 },
        ]
        
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

export const useMarkets = (type: MarketsType) => {

    const marketsKey = "markets";

    const { data } = useMarketsStream();
    const { configStore } = useContext(OrderlyContext);

    if (!configStore.get(marketsKey)) {
        // WARNING: remember remove
        const jsonStr = localStorage.getItem(marketsKey);
        if (jsonStr) {
            configStore.set(marketsKey, JSON.parse(jsonStr));
        } else {
            configStore.set(marketsKey, {
                recent: [],
                favorites: [],
                favoriteTabs: [{ name: "Popular", id: 1 }]
            });
        }
    }

    const getFavoriteTabs = useCallback(() => {
        const tabs = configStore.get(marketsKey)["favoriteTabs"];
        return (tabs || [{ name: "Popular", id: 1 }]) as FavoriteTab[];
    }, [configStore]);

    const getFavorites = useCallback(() => {
        const curData = configStore.get(marketsKey,)["favorites"];
        return (curData || {}) as Favorite[];
    }, [configStore]);

    const getRecent = useCallback(() => {
        const curData = configStore.get(marketsKey)["recent"];
        return (curData || {}) as Recent[];
    }, [configStore]);

    const [favoriteTabs, setFavoriteTabs] = useState(getFavoriteTabs());
    const [favorites, setFavorites] = useState(getFavorites());
    const [recent, setRecent] = useState(getRecent());

    const updateFavoriteTabs = useCallback((tab: FavoriteTab, operator: {
        add?: boolean,
        update?: boolean,
        delete?: boolean,
    }) => {
        var tabs = favoriteTabs;
        const index = tabs.findIndex((item) => item.id === tab.id);
        console.log("find new tabs", tabs, index, tab);
        if (operator.add) {
            tabs.push(tab);
        } else if (operator.update) {
            if (index !== -1) {
                tabs[index] = tab;
            }
        } else if (operator.delete) {
            if (index !== -1) {
                console.log("del begin", tabs);
                tabs.splice(index, 1);
                console.log("del finishied", tabs);

            }
        }
        setFavoriteTabs(tabs);
        configStore.set(marketsKey, {
            ...configStore.getOr(marketsKey, {}),
            "favoriteTabs": tabs
        });
        // WARNING: remember remove
        localStorage.setItem(marketsKey, JSON.stringify(configStore.get(marketsKey)));
    }, [configStore]);

    const setRecentData = useCallback((symbol: API.MarketInfoExt) => {
        const curData = getRecent();
        const index = curData.findIndex((item) => item.name == symbol.symbol);
        if (index !== -1) {
            curData.splice(index, 1);
        }
        curData.unshift({ name: symbol.symbol });
        configStore.set(marketsKey, {
            ...configStore.getOr(marketsKey, {}),
            "recent": curData
        });
        // WARNING: remember remove
        localStorage.setItem(marketsKey, JSON.stringify(configStore.get(marketsKey)));
        setRecent(curData);
    }, [configStore]);



    const setFavoritesData = useCallback((symbol: API.MarketInfoExt, tab: FavoriteTab, remove: boolean = false) => {
        console.log("set fav data");

        const curData = getFavorites();
        const index = curData.findIndex((item) => item.name == symbol.symbol);

        if (index === -1) { // can not find
            if (!remove) {
                // insert
                curData.unshift({ name: symbol.symbol, tabs: [tab] });
            }
        } else {
            const favorite = curData[index];
            if (remove) {
                const tabs = favorite.tabs.filter((tab) => tab.id != tab.id);
                if (tabs.length === 0) { // del favorite
                    curData.splice(index, 1);
                } else {
                    curData[index] = { ...favorite, tabs };
                }
            } else { // insert
                const tabs = favorite.tabs;
                tabs.push(tab);
                curData[index] = { ...favorite, tabs };
            }
        }

        configStore.set(marketsKey, {
            ...configStore.getOr(marketsKey, {}),
            "favorites": curData
        });
        // WARNING: remember remove
        localStorage.setItem(marketsKey, JSON.stringify(configStore.get(marketsKey)));
        console.log("set fav data update state", curData, configStore.get(marketsKey));
        setFavorites(curData);
    }, [configStore]);

    const getData = useCallback((type: MarketsType) => {
        // get data
        const localData = type === MarketsType.FAVORITES ? getFavorites() : getRecent();
        // filter
        const keys = localData.map((item) => item.name);
        const filter = type == MarketsType.ALL ?
            data :
            data?.filter((item) => keys.includes(item.symbol));

        const favoritesData = favorites;
        const favoriteKeys = favoritesData.map((item) => item.name);
        if (filter) {
            for (let index = 0; index < filter.length; index++) {
                const element = filter[index];
                const isFavorite = type == MarketsType.FAVORITES ?
                    true :
                    (favoriteKeys.includes(element.symbol));

                const fIndex = favoritesData.findIndex((item) => item.name === element.symbol);
                const tabs = fIndex === -1 ? [] : favoritesData[fIndex].tabs;
                filter[index] = {
                    ...filter[index],
                    // @ts-ignore
                    isFavorite,
                    tabs,
                };
            }
        }

        return filter;

    }, [configStore, data, favoriteTabs, favorites, recent]);

    const addToHistory = useCallback((symbol: API.MarketInfoExt) => {
        setRecentData(symbol);
    }, []);

    const updateSymbolFavoriteState = (symbol: API.MarketInfoExt, tab: FavoriteTab, del: boolean = false) => {
        setFavoritesData(symbol, tab, del);
    };

    const markets = useMemo(() => {

        switch (type) {
            case MarketsType.FAVORITES:
                return getData(MarketsType.FAVORITES);
            case MarketsType.RECENT:
                return getData(MarketsType.RECENT);
            case MarketsType.ALL:
                const data = getData(MarketsType.ALL);
                console.log("all type", data);

                return data;

        }

    }, [data, type, favoriteTabs, favorites, recent]);

    // console.log("config store", configStore, favoriteTabs, markets);

    return [
        markets,
        {
            favoriteTabs,
            addToHistory,
            // updateFavoriteTabs("tab", operator: {add/update/delete})
            updateFavoriteTabs,
            updateSymbolFavoriteState,
        },
    ] as const;
}