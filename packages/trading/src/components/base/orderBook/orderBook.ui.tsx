import { FC } from "react";
import { Box, Flex, Text } from "@orderly.network/ui";
import { OrderBookState } from "./orderBook.script";
import { DesktopOrderBook } from "../../desktop/orderBook/index.desktop";
import { OrderBook as MWebOrderBook } from "../../mobile/orderBook";

export const OrderBook: FC<
  OrderBookState & {
    className?: string;
    tabletMediaQuery: string;
  }
> = (props) => {
  return (
    <Box className="oui-font-semibold" width={"100%"} height={"100%"}>
      {props.isMWeb ? (
        <MWebOrderBook
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
          symbolInfo={props.symbolInfo}
          tabletMediaQuery={props.tabletMediaQuery}
        />
      ) : (
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
          tabletMediaQuery={props.tabletMediaQuery}
        />
      )}
    </Box>
  );
};
