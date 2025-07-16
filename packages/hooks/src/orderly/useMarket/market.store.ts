import { produce } from "immer";
import { create } from "zustand";
import { API } from "@orderly.network/types";

type MarketStore = {
  market: API.MarketInfoExt[];
  // marketSymbols: string[];
  marketMap: Record<string, API.MarketInfoExt> | null;
};

type MarketActions = {
  updateMarket: (data: API.MarketInfoExt[]) => void;
  updateTicker: (data: API.MarketInfoExt[]) => void;
};

const useMarketStore = create<MarketStore & { actions: MarketActions }>(
  (set, get) => ({
    market: [],
    // marketSymbols: [],
    marketMap: null,
    actions: {
      updateMarket: (data) => {
        // const symbols: string[] = [];
        const marketMap: Record<string, API.MarketInfoExt> = {};

        data.forEach((item) => {
          // symbols.push(item.symbol);
          marketMap[item.symbol] = item;
        });

        set({
          market: data,
          // marketSymbols: symbols,
          marketMap: marketMap,
        });
      },
      updateTicker: (data) => {
        // console.log(
        //   "updateTicker",
        //   data.filter((item) => item.symbol === "PERP_ETH_USDC")[0]
        // );
        set(
          produce((state) => {
            state.market = data;
          }),
        );
      },
    },
  }),
);

export { useMarketStore };
