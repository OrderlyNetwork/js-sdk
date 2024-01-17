import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../orderbook/header";
import { Bids } from "../orderbook/bids";
import { Asks } from "../orderbook/asks";
import { MarkPrice } from "../orderbook/markPrice";
import { DepthSelect } from "@/block/orderbook/depthSelect";
import { OrderBookProvider } from "@/block/orderbook/orderContext";
import { Spinner } from "@/spinner";
import { cn } from "@/utils/css";
import { DesktopHeader } from "./header.desktop";

export interface DesktopOrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number[];
  onItemClick?: (item: number[]) => void;
  depth: number[];
  activeDepth: number;
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

export const DesktopOrderBook: FC<DesktopOrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;
  // const onModeChange = useCallback((mode: QtyMode) => {}, []);

  //
  const divRef = useRef(null);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setShowTotal(() => width >= 360 && width < 468);
      }
    });

    const targetDiv = divRef.current;

    if (targetDiv) {
      resizeObserver.observe(targetDiv);
    }

    return () => {
      if (targetDiv) {
        resizeObserver.unobserve(targetDiv);
      }
    };
  }, []);

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 20}
      onItemClick={props.onItemClick}
      depth={props.activeDepth}
      showTotal={showTotal}
    >
      <div className={cn("orderly-h-full orderly-relative", props.className)} ref={divRef}>
        <DepthSelect
          depth={props.depth}
          value={props.activeDepth}
          onChange={onDepthChange}
        />
        <DesktopHeader quote={quote} base={base} />
        <Asks data={props.asks} />
        <MarkPrice lastPrice={lastPrice} markPrice={markPrice} />
        <Bids data={props.bids} />
        {isLoading && (
          <div className="orderly-absolute orderly-left-0 orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-z-10 orderly-flex orderly-items-center orderly-justify-center orderly-bg-base-800/70 orderly-h-full orderly-min-h-[420px]">
            <Spinner />
          </div>
        )}
      </div>
    </OrderBookProvider>
  );
};
