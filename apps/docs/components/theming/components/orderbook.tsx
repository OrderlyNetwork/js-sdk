import { useDemoContext } from "@/components/demoContext";
import { useOrderbookStream, useSymbolsInfo } from "@orderly.network/hooks";
import { OrderBook } from "@orderly.network/react";

export const OrderBookComponent = () => {
  const { symbol } = useDemoContext();

  const config = useSymbolsInfo();
  const symbolInfo = config?.[symbol];

  const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
    useOrderbookStream(symbol, undefined, {
      level: 7,
    });

  return (
    <div className="py-5">
      <OrderBook
        level={7}
        asks={data.asks!}
        bids={data.bids!}
        markPrice={data.markPrice}
        lastPrice={data.middlePrice!}
        depth={allDepths!}
        activeDepth={depth!}
        base={symbolInfo("base")}
        quote={symbolInfo("quote")}
        isLoading={isLoading}
        onItemClick={onItemClick}
        onDepthChange={onDepthChange}
        cellHeight={22}
      />
    </div>
  );
};
