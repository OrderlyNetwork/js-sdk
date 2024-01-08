import { useCallback, useContext, useMemo } from "react";
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
        ORDERLY_MARKETS_RECENT_KEY: {
            `${symbol_name}`: {
                "symbol": symbol,
                "time": time,
            }
        },
        ORDERLY_MARKETS_FAVORITES_KEY: {
            `${symbol_name}`: {
                "symbol": symbol,
                "time": time,
            }
        }
        
    }
}
*/

export const useMarkets = (type: MarketsType) => {

    const marketsKey = "markets";

    const { data } = useMarketsStream();
    const { configStore } = useContext(OrderlyContext);

    const getRecentMap = () => {
        let oldData = configStore.getOr(marketsKey, { "ORDERLY_MARKETS_RECENT_KEY": {} })["ORDERLY_MARKETS_RECENT_KEY"];
        return { ...oldData };
    };

    const setRecentData = (symbol: API.MarketInfoExt) => {
        let oldData = getRecentMap();
        oldData[symbol.symbol] = {
            symbol,
            time: Date.now() // timestamp
        }
        configStore.set(marketsKey, {"ORDERLY_MARKETS_RECENT_KEY": oldData});
    };

    const getFavoritesMap = () => {
        let oldData = configStore.getOr(marketsKey, { "ORDERLY_MARKETS_FAVORITES_KEY": {} })["ORDERLY_MARKETS_FAVORITES_KEY"];
        return { ...oldData };
    };

    const setFavoritesData = (symbol: API.MarketInfoExt) => {
        let oldData = getRecentMap();
        oldData[symbol.symbol] = {
            symbol,
            time: Date.now() // timestamp
        }
        configStore.set(marketsKey, {"ORDERLY_MARKETS_FAVORITES_KEY": oldData});
    };

    const getData = useCallback((type: MarketsType) => {
        const localData = type === MarketsType.FAVORITES ? getFavoritesMap() : getRecentMap();

        console.log("type", type, localData);
        
        const keys = Object.keys(localData);

        const filter = data?.filter((item) => keys.includes(item.symbol))

        console.log("filter begin", filter);
        
        filter?.sort((a,b) => {
            var aTime = localData[a.symbol].time;
            var bTime = localData[b.symbol].time;
            console.log("filtering", aTime, bTime);
            
            return bTime - aTime;
        })
        
        console.log("filter filter", filter);
        return filter;

    }, [configStore, data]);

    const addHistory = useCallback((symbol: API.MarketInfoExt) => {
        setRecentData(symbol);
    }, []);


    console.log("config store", configStore);


    const markets = useMemo(() => {

        switch (type) {
            case MarketsType.FAVORITES:
                return getData(MarketsType.FAVORITES);
            case MarketsType.RECENT:
                return getData(MarketsType.RECENT);
            case MarketsType.ALL:
                return data;
        }

    }, [data, type]);

    return [
        markets,
        {
            addHistory,
        },
    ] as const;
}