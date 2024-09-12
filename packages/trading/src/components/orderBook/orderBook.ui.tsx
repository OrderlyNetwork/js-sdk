import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { OrderBookState } from "./orderBook.script";
import { DesktopOrderBook } from "./desktop/index.desktop";

export const OrderBook: FC<
  OrderBookState & {
    className?: string;
  }
> = (props) => {
  return (
    <Flex>
      <DesktopOrderBook
        level={props.level}
        asks={props.asks!}
        bids={props.bids!}
        markPrice={props.markPrice!}
        lastPrice={props.lastPrice!}
        depths={props.depths}
        activeDepth={props.selDepth}
        base={props.base}
        quote={props.quote}
        isLoading={props.isLoading}
        onItemClick={props.onItemClick}
        cellHeight={props.cellHeight}
        onDepthChange={props.onDepthChange}
        className={props.className}
        pendingOrders={props.pendingOrders}
        symbolInfo={props.symbolInfo}
      />
    </Flex>
  );
};
