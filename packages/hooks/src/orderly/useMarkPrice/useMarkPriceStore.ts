import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

type MarkPriceStore = {
  markPrices: Record<string, number>;
};

type MarkPriceActions = {
  updateMarkPrice: (markPrice: Record<string, number>) => void;
  getMarkPriceBySymbol: (symbol: string) => number;
};

const useMarkPriceStore = create<
  MarkPriceStore & { actions: MarkPriceActions }
>()((set, get) => ({
  markPrices: {},

  actions: {
    updateMarkPrice: (markPrice) => {
      set(
        {
          markPrices: markPrice,
        }
        // (state) => {
        //   state.markPrices = markPrice;
        // },
        // true,
        // "updateMarkPrice"
      );
    },
    getMarkPriceBySymbol: (symbol: string) => {
      return get().markPrices[symbol];
    },
  },
}));

const useMarkPrices = () => useMarkPriceStore((state) => state.markPrices);
const useMarkPriceBySymbol = (symbol: string) =>
  useMarkPriceStore((state) => state.actions.getMarkPriceBySymbol(symbol));
const useMarkPriceActions = () => useMarkPriceStore((state) => state.actions);

export {
  useMarkPriceStore,
  useMarkPrices,
  useMarkPriceBySymbol,
  useMarkPriceActions,
};
