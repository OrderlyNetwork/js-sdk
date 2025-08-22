import React from "react";
import { Box } from "@orderly.network/ui";
import { DesktopOrderBook } from "../../desktop/orderBook/index.desktop";
import { OrderBook as MWebOrderBook } from "../../mobile/orderBook";
import type { OrderBookState } from "./orderBook.script";

export const OrderBook: React.FC<OrderBookState & { className?: string }> = (
  props,
) => {
  return (
    <Box className="oui-font-semibold" width={"100%"} height={"100%"}>
      {props.isMobile ? (
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
        />
      )}
    </Box>
  );
};
