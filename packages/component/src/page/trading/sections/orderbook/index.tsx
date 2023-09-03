import { OrderBook } from "@/block/orderbook";
import { useOrderbookStream, useSymbolsInfo } from "@orderly.network/hooks";
import { FC } from "react";

interface MyOrderBookProps {
  symbol: string;
}

export const MyOrderBook: FC<MyOrderBookProps> = (props) => {
  const { symbol } = props;
  const [data, { onDepthChange }] = useOrderbookStream(symbol, undefined, {
    level: 7,
  });
  const config = useSymbolsInfo();
  const symbolInfo = config?.[symbol];
  return (
    <div className="pr-1">
      <OrderBook
        level={7}
        asks={data.asks}
        bids={data.bids}
        markPrice={data.markPrice}
        lastPrice={data.middlePrice}
        depth={[0.0001, 0.001]}
        base={symbolInfo("base")}
        quote={symbolInfo("quote")}
      />
    </div>
  );
};
