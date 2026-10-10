import { FC, type ReactNode } from "react";
import { EMPTY_LIST } from "@orderly.network/types";
import { cn, Flex, Grid, Spinner } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookProvider } from "../../base/orderBook/orderContext";
import { InjectableDesktopAsks } from "./asks.desktop";
import { InjectableDesktopBids } from "./bids.desktop";
import { DesktopDepthSelect } from "./depthSelect.desktop";
import { DesktopHeader } from "./header.desktop";
import { DesktopMarkPrice } from "./markPrice.desktop";
import { useOrderBookDisplayOptions } from "./useOrderBookDisplayOptions";

/**
 * Lean, desktop-only order book ladder for surfaces that drive the book
 * themselves (no symbol/WS dependency): column header + optional depth
 * selector + asks + price row + bids. No buy/sell ratio chrome.
 */
export interface OrderBookLadderProps {
  /** Ask levels, best ask last: `[price, quantity, cumulative qty, cumulative amount]`. */
  asks: number[][];
  /** Bid levels, best bid first. */
  bids: number[][];
  /** `[previous, current]` middle price; drives the arrow in the price row. */
  lastPrice: number[];
  /** Overrides the middle-price display while preserving the rest of the price row. */
  middlePriceContent?: ReactNode;
  /** Mark price for the price row; defaults to the current middle price. */
  markPrice?: number;
  /** Renders the flagged mark-price label. @default true */
  showMarkPrice?: boolean;
  /** Renders the spread ratio. @default true */
  showSpread?: boolean;
  base: string;
  quote: string;
  symbolInfo: BasicSymbolInfo;
  /** Active depth key; its decimals drive the price precision. Defaults to `symbolInfo.base_tick`. */
  depth?: string;
  /** Depth options; providing them renders the depth selector toolbar row. */
  depths?: string[];
  onDepthChange?: (depth: number) => void;
  /** @default 20 */
  cellHeight?: number;
  onItemClick?: (item: number[]) => void;
  /** Open-order prices marked with a dot on matching rows. */
  pendingOrders?: number[];
  isLoading?: boolean;
  className?: string;
}

export const OrderBookLadder: FC<OrderBookLadderProps> = (props) => {
  const {
    asks,
    bids,
    lastPrice,
    middlePriceContent,
    markPrice,
    showMarkPrice = true,
    showSpread = true,
    base,
    quote,
    symbolInfo,
    depth,
    depths,
    onDepthChange,
    cellHeight = 20,
    onItemClick,
    pendingOrders,
    isLoading,
    className,
  } = props;

  const { ref, showTotal } = useOrderBookDisplayOptions(base, quote);

  const activeDepth =
    depth ??
    (typeof symbolInfo.base_tick === "number"
      ? String(symbolInfo.base_tick)
      : undefined);

  const toolbar =
    depths && depths.length > 0 ? (
      <Flex justify="between" itemAlign="center" className="oui-pe-3">
        <DesktopDepthSelect
          depths={depths}
          value={activeDepth}
          onChange={onDepthChange}
        />
      </Flex>
    ) : null;

  return (
    <OrderBookProvider
      cellHeight={cellHeight}
      onItemClick={onItemClick}
      depth={activeDepth}
      showTotal={showTotal}
      pendingOrders={pendingOrders || EMPTY_LIST}
      symbolInfo={symbolInfo}
      showBuySellRatio={false}
    >
      <Grid
        cols={1}
        rows={toolbar ? 5 : 4}
        id="oui-orderbook-ladder"
        ref={ref}
        className={cn(
          "oui-orderBook",
          "oui-relative oui-size-full",
          toolbar
            ? "oui-grid-rows-[auto,auto,1fr,auto,1fr]"
            : "oui-grid-rows-[auto,1fr,auto,1fr]",
          className,
        )}
      >
        {toolbar}
        <DesktopHeader quote={quote} base={base} />
        {/* Best ask hugs the price row when the ladder is taller than its levels. */}
        <div className="oui-flex oui-min-h-0 oui-flex-col oui-justify-end">
          <InjectableDesktopAsks
            data={[...asks]}
            symbolInfo={symbolInfo}
            depth={activeDepth}
          />
        </div>
        <DesktopMarkPrice
          middlePriceContent={middlePriceContent}
          lastPrice={lastPrice}
          markPrice={markPrice ?? lastPrice?.[1] ?? 0}
          // Shallow copy so consumers never have their arrays mutated inside
          // the component (see DesktopOrderBook).
          asks={[...asks]}
          bids={[...bids]}
          symbolInfo={symbolInfo}
          showMarkPrice={showMarkPrice}
          showSpread={showSpread}
        />
        <InjectableDesktopBids
          data={[...bids]}
          symbolInfo={symbolInfo}
          depth={activeDepth}
        />
        {isLoading && (
          <div className="oui-bg-bg-8/70 oui-absolute oui-inset-0 oui-z-10 oui-flex oui-items-center oui-justify-center">
            <Spinner />
          </div>
        )}
      </Grid>
    </OrderBookProvider>
  );
};
