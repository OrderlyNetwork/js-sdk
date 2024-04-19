import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { DepthSelect } from "@/block/orderbook/depthSelect";
import { OrderBookProvider } from "@/block/orderbook/orderContext";
import { QtyMode } from "./types";
import { Spinner } from "@/spinner";
import { cn } from "@/utils/css";

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
      <div id="orderly-orderbook-mobile" className={cn("orderly-h-full orderly-relative", props.className)} >
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
          <div className="orderly-absolute orderly-left-0 orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-z-10 orderly-flex orderly-items-center orderly-justify-center orderly-bg-base-800/70 orderly-h-full orderly-min-h-[420px]">
            <Spinner />
          </div>
        )}
      </div>
    </OrderBookProvider>
  );
};
