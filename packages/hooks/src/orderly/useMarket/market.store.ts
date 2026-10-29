import { create } from "zustand";
import { API } from "@orderly.network/types";

export type MarketDataStatus = {
  readonly isReady: boolean;
  readonly isLoading: boolean;
  readonly error: unknown;
};

type MarketStore = {
  market: API.MarketInfoExt[];
  marketMap: Record<string, API.MarketInfoExt> | null;
  requestStatus: MarketDataStatus;
};

type MarketActions = {
  updateMarket: (data: API.MarketInfoExt[], status?: MarketDataStatus) => void;
};

export const useMarketStore = create<MarketStore & { actions: MarketActions }>(
  (set, get) => ({
    market: [],
    marketMap: null,
    requestStatus: { isReady: false, isLoading: true, error: undefined },
    actions: {
      updateMarket: (data, status) => {
        // Keep successful data visible during a failed or pending revalidation.
        if (status && !status.isReady && get().requestStatus.isReady) {
          set({
            requestStatus: { ...status, isReady: true, isLoading: false },
          });
          return;
        }
        const marketMap: Record<string, API.MarketInfoExt> = {};

        data.forEach((item) => {
          marketMap[item.symbol] = item;
        });

        set({
          market: data,
          marketMap: marketMap,
          ...(status ? { requestStatus: status } : {}),
        });
      },
    },
  }),
);

export const useMarketList = () => {
  return useMarketStore((state) => state.market);
};

export const useMarketMap = () => {
  return useMarketStore((state) => state.marketMap);
};
