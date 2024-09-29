import { useOrderBookAndTradesScript } from "./orderBookAndTrades.script";
import { OrderBookAndTrades } from "./orderBookAndTrades.ui";

export const OrderBookAndTradesWidget = (props: {
    symbol: string;
    tabletMediaQuery: string;
}) => {
    const state = useOrderBookAndTradesScript(props.symbol);
    return (<OrderBookAndTrades tabletMediaQuery={props.tabletMediaQuery} {...state} />);
};
