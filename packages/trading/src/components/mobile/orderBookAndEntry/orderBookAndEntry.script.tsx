import { useTradingPageContext } from "../../../provider/context";

export const useOrderBookAndEntryScript = () => {

    const { symbol, tabletMediaQuery, } = useTradingPageContext();
    return {
        symbol,tabletMediaQuery,
    };
};

export type OrderBookAndEntryState = ReturnType<typeof useOrderBookAndEntryScript>;
