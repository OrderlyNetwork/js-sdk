import { useOrderBookScript } from "./orderBook.script";
import { OrderBook } from "./orderBook.ui";

export const OrderBookWidget = (props: {
  className?: string;
  symbol: string;
  height?: number;
  tabletMediaQuery: string;
}) => {
  const state = useOrderBookScript({
    symbol: props.symbol,
    height: props.height,
    tabletMediaQuery: props.tabletMediaQuery,
  });
  return <OrderBook {...state} className={props.className} tabletMediaQuery={props.tabletMediaQuery} />;
};
