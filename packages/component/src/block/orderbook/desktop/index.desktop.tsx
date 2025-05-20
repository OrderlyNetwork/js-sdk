import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { OrderBookProvider } from "@/block/orderbook/orderContext";
import { Spinner } from "@/spinner";
import { cn } from "@/utils/css";
import { DesktopAsks } from "./asks.desktop";
import { DesktopBids } from "./bids.desktop";
import { DesktopDepthSelect } from "./depthSelect.desktop";
import { DesktopHeader } from "./header.desktop";
import { DesktopMarkPrice } from "./markPrice.desktop";

export interface DesktopOrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number[];
  onItemClick?: (item: number[]) => void;
  depth: string[];
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
  pendingOrders?: number[];
}

export const DesktopOrderBook: FC<DesktopOrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;
  // const onModeChange = useCallback((mode: QtyMode) => {}, []);

  //
  const divRef = useRef(null);
  const [showTotal, setShowTotal] = useState(false);

  const rangeInfo = [
    { left: 370, right: 600 },
    { left: 740, right: 800 },
  ];

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { inlineSize: width } = entry.borderBoxSize[0];
        const count = rangeInfo.reduce(
          (a, b) => a + (width >= b.left && width < b.right ? 1 : 0),
          0,
        );
        setShowTotal(() => count > 0);
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
      pendingOrders={props.pendingOrders || []}
    >
      <div
        id="orderly-orderbook-desktop"
        className={cn("orderly-h-full orderly-relative", props.className)}
        ref={divRef}
      >
        <DesktopDepthSelect
          depth={props.depth}
          value={props.activeDepth}
          onChange={onDepthChange}
        />
        <DesktopHeader quote={quote} base={base} />
        <DesktopAsks data={[...props.asks]} />
        <DesktopMarkPrice
          lastPrice={lastPrice}
          markPrice={markPrice}
          asks={[...props.asks]}
          bids={[...props.bids]}
        />
        <DesktopBids data={[...props.bids]} />
        {isLoading && (
          <div className="orderly-absolute orderly-left-0 orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-z-10 orderly-flex orderly-items-center orderly-justify-center orderly-bg-base-800/70 orderly-h-full orderly-min-h-[420px]">
            <Spinner />
          </div>
        )}
      </div>
    </OrderBookProvider>
  );
};
