import { FC, useEffect, useRef, useState } from "react";
import { DesktopBids } from "./bids.desktop";
import { DesktopAsks } from "./asks.desktop";
import { DesktopMarkPrice } from "./markPrice.desktop";
import { DesktopHeader } from "./header.desktop";
import { DesktopDepthSelect } from "./depthSelect.desktop";
import { cn, Grid, Spinner } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookProvider } from "../../base/orderBook/orderContext";
import { useLocalStorage } from "@orderly.network/hooks";

export interface DesktopOrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number[];
  onItemClick?: (item: number[]) => void;
  depths: string[];
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
  symbolInfo: BasicSymbolInfo;
}

const rangeInfo = [
  { left: 370, right: 600 },
  { left: 740, right: 800 },
];

export const DesktopOrderBook: FC<DesktopOrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;

  const divRef = useRef<HTMLDivElement>(null);

  const [, setTokenType] = useLocalStorage("orderbook-token-type", "ETH");

  useEffect(() => {
    if (base) {
      setTokenType(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { inlineSize: width } = entry.borderBoxSize[0];
        const count = rangeInfo.reduce(
          (a, b) => a + (width >= b.left && width < b.right ? 1 : 0),
          0
        );
        setShowTotal(width >= 360);
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

  ///

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 20}
      onItemClick={props.onItemClick}
      depth={props.activeDepth}
      showTotal={showTotal}
      pendingOrders={props.pendingOrders || []}
      symbolInfo={props.symbolInfo}
    >
      <Grid
        cols={1}
        rows={5}
        id="oui-orderbook-desktop"
        ref={divRef}
        className="oui-grid-rows-[auto,auto,1fr,auto,1fr] oui-relative oui-h-full oui-w-full"
      >
        <DesktopDepthSelect
          depths={props.depths}
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
          symbolInfo={props.symbolInfo}
        />
        <DesktopBids data={[...props.bids]} />
        {isLoading && (
          <div className="oui-absolute oui-left-0 oui-top-0 oui-right-0 oui-bottom-0 oui-z-10 oui-flex oui-items-center oui-justify-center oui-bg-bg-8/70">
            <Spinner />
          </div>
        )}
      </Grid>
      {/* <div
        id="oui-orderbook-desktop"
        className={cn("oui-h-full oui-w-full oui-relative oui-bg-red-300", props.className)}
        ref={divRef}
      >
        <DesktopDepthSelect
          depths={props.depths}
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
          symbolInfo={props.symbolInfo}
        />
        <DesktopBids data={[...props.bids]}/>
        {isLoading && (
          <div className="oui-absolute oui-left-0 oui-top-0 oui-right-0 oui-bottom-0 oui-z-10 oui-flex oui-items-center oui-justify-center oui-bg-bg-8/70">
            <Spinner />
          </div>
        )}
      </div> */}
    </OrderBookProvider>
  );
};
