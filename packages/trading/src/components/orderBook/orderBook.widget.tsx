import { useOrderBookScript } from "./orderBook.script";
import { OrderBook } from "./orderBook.ui";

export const OrderBookWidget = (props: {
  className?: string;
  symbol: string;
  height?: number;
}) => {
  const state = useOrderBookScript({
    symbol: props.symbol,
    height: props.height,
  });
  return <OrderBook {...state} className={props.className} />;
};
