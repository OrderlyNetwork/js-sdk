import { OrderBook } from "@/block/orderbook";
import { SymbolProvider } from "@/provider";
import { cn } from "@/utils/css";
import {
  useOrderbookStream,
  useSymbolsInfo,
  useEventEmitter,
} from "@orderly.network/hooks";
import { Decimal, removeTrailingZeros } from "@orderly.network/utils";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";

interface MyOrderBookProps {
  symbol: string;
  className?: string;
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

  const quote_dp = symbolInfo("quote_dp");

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

  const selDepth = useMemo(() => {

    if (typeof depth === 'undefined' || typeof quote_dp === 'undefined') {
      return undefined;
    }

    let formattedNumber = removeTrailingZeros(depth);
    return formattedNumber;
  }, [depth, quote_dp]);


  const depths = useMemo(() => {
    return allDepths?.map((e) => (removeTrailingZeros(e))) || [];
  }, [allDepths,quote_dp]);

  return (
    <div
      id="orderly-order-book"
      className={cn("orderly-pr-1", props.className)}
    >
      <SymbolProvider symbol={symbol}>
        <OrderBook
          level={7}
          asks={data.asks!}
          bids={data.bids!}
          markPrice={data.markPrice!}
          lastPrice={data.middlePrice!}
          depth={depths}
          activeDepth={selDepth}
          base={symbolInfo("base")}
          quote={symbolInfo("quote")}
          isLoading={isLoading}
          onItemClick={onItemClick}
          cellHeight={cellHeight}
          onDepthChange={onDepthChange}
          // @ts-ignore
          pendingOrders={[]}
        />
      </SymbolProvider>
    </div>
  );
};

export const MemorizedOrderBook = memo(MyOrderBook);
