import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { OrderBookProvider } from "../orderContext";
import { DepthSelect } from "./depthSelect";
import { cn, Spinner } from "@orderly.network/ui";
export interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number[];
  onItemClick?: (item: number[]) => void;
  depth?: string[];
  activeDepth?: string;
  onDepthChange?: (depth: number) => void;
  //
  autoSize?: boolean;
  level?: number;
  base: string;
  quote: string;

  isLoading?: boolean;

  cellHeight?: number;

  className?: string;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;
  // const onModeChange = useCallback((mode: QtyMode) => {}, []);

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 20}
      onItemClick={props.onItemClick}
      depth={props.activeDepth}
      pendingOrders={[]}
      showTotal={false}
    >
      <div id="oui-orderbook-mobile" className={cn("oui-h-full oui-relative", props.className)} >
        <Header quote={quote} base={base} />
        <Asks data={props.asks} />
        <MarkPrice lastPrice={lastPrice} markPrice={markPrice} />
        <Bids data={props.bids} />
        <DepthSelect
          depth={props.depth || []}
          value={props.activeDepth}
          onChange={onDepthChange}
        />
        {isLoading && (
          <div className="oui-absolute oui-left-0 oui-top-0 oui-right-0 oui-bottom-0 oui-z-10 oui-flex oui-items-center oui-justify-center oui-bg-base-800/70 oui-h-full oui-min-h-[420px]">
            <Spinner />
          </div>
        )}
      </div>
    </OrderBookProvider>
  );
};
