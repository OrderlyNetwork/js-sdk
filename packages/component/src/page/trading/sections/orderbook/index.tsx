import { OrderBook } from "@/block/orderbook";
import { SymbolProvider } from "@/provider";
import {
  useOrderbookStream,
  useSymbolsInfo,
  useEventEmitter,
} from "@orderly.network/hooks";
import { FC, useEffect, useRef, useState } from "react";

interface MyOrderBookProps {
  symbol: string;
}

export const MyOrderBook: FC<MyOrderBookProps> = (props) => {
  const { symbol } = props;
  const [cellHeight, setCellHeight] = useState(20);
  const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
    useOrderbookStream(symbol, undefined, {
      level: 7,
    });
  const config = useSymbolsInfo();
  const symbolInfo = config?.[symbol];

  const ee = useEventEmitter();

  useEffect(() => {
    const resizeHandler = ({ height }: { height: number }) => {
      let innerHeight = height - 116;
      let cellHeight = innerHeight / 14;

      setCellHeight(() => cellHeight);
    };

    ee.on("dom:orderEntry:resize", resizeHandler);

    return () => {
      ee.off("dom:orderEntry:resize", resizeHandler);
    };
  }, []);

  return (
    <div className="pr-1">
      <SymbolProvider symbol={symbol}>
        <OrderBook
          level={7}
          asks={data.asks}
          bids={data.bids}
          markPrice={data.markPrice}
          lastPrice={data.middlePrice}
          depth={allDepths}
          activeDepth={depth}
          base={symbolInfo("base")}
          quote={symbolInfo("quote")}
          isLoading={isLoading}
          onItemClick={onItemClick}
          cellHeight={cellHeight}
          onDepthChange={onDepthChange}
        />
      </SymbolProvider>
    </div>
  );
};
