import { OrderBook } from "@/block/orderbook";
import { useOrderbook, useInfo } from "@orderly/hooks";
import { FC } from "react";

interface MyOrderBookProps {
  symbol: string;
}

export const MyOrderBook: FC<MyOrderBookProps> = (props) => {
  const { symbol } = props;
  const [data, { onDepthChange }] = useOrderbook(symbol, undefined, {
    level: 7,
  });
  const { data: info } = useInfo(symbol);
  return (
    <div className="pr-1">
      <OrderBook
        level={7}
        asks={data.asks}
        bids={data.bids}
        markPrice={""}
        lastPrice={""}
        depth={[0.001, 0.01]}
      />
    </div>
  );
};
