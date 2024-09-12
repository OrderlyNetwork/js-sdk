import { useOrderBookScript } from "./orderBook.script";
import { OrderBook } from "./orderBook.ui";

export const OrderBookWidget = (props: {
  className?: string;
  symbol: string;
}) => {
  const state = useOrderBookScript({
    symbol: props.symbol,
  });
  return <OrderBook {...state} className={props.className} />;
};
