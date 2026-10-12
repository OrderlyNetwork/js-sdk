import { FC, type ReactNode } from "react";
import { EMPTY_LIST } from "@orderly.network/types";
import { cn, Flex, Spinner } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookProvider } from "../../base/orderBook/orderContext";
import { Asks } from "./asks";
import { Bids } from "./bids";
import { DepthSelect } from "./depthSelect";
import { Header } from "./header";
import { MarkPrice } from "./markPrice";

/**
 * Lean, mobile-only order book ladder for surfaces that drive the book
 * themselves (no symbol/WS dependency): two-column header (fixed price
 * column + a picker that switches the quantity column between qty /
 * total base / total quote) + asks + price row + bids + optional depth
 * picker. The picked unit is persisted under ORDERBOOK_MOBILE_COIN_TYPE_KEY
 * and therefore shared with the perps mobile order book. No funding-rate
 * or buy/sell-ratio chrome.
 */
export interface MobileOrderBookLadderProps {
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
  base: string;
  quote: string;
  symbolInfo: BasicSymbolInfo;
  /** Active depth key; its decimals drive the price precision. Defaults to `symbolInfo.base_tick`. */
  depth?: string;
  /** Depth options; providing them renders the depth picker row. */
  depths?: string[];
  onDepthChange?: (depth: number) => void;
  /** @default 20 */
  cellHeight?: number;
  onItemClick?: (item: number[]) => void;
  isLoading?: boolean;
  className?: string;
}

export const MobileOrderBookLadder: FC<MobileOrderBookLadderProps> = (
  props,
) => {
  const {
    asks,
    bids,
    lastPrice,
    middlePriceContent,
    markPrice,
    showMarkPrice = true,
    base,
    quote,
    symbolInfo,
    depth,
    depths,
    onDepthChange,
    cellHeight = 20,
    onItemClick,
    isLoading,
    className,
  } = props;

  const activeDepth =
    depth ??
    (typeof symbolInfo.base_tick === "number"
      ? String(symbolInfo.base_tick)
      : undefined);

  return (
    <OrderBookProvider
      cellHeight={cellHeight}
      onItemClick={onItemClick}
      depth={activeDepth}
      pendingOrders={EMPTY_LIST}
      showTotal={false}
      symbolInfo={symbolInfo}
      showBuySellRatio={false}
    >
      <Flex
        direction={"column"}
        p={2}
        id="oui-orderbook-mobile-ladder"
        className={cn("oui-orderBook oui-relative oui-size-full", className)}
        justify={"start"}
        itemAlign={"start"}
      >
        <Header quote={quote} base={base} />
        <Asks data={asks} />
        <MarkPrice
          middlePriceContent={middlePriceContent}
          lastPrice={lastPrice}
          markPrice={markPrice ?? lastPrice?.[1] ?? 0}
          showMarkPrice={showMarkPrice}
        />
        <Bids data={bids} />
        {depths && depths.length > 0 ? (
          <DepthSelect
            depth={depths}
            value={activeDepth}
            onChange={onDepthChange}
          />
        ) : null}
        {isLoading && (
          <div className="oui-bg-base-8/70 oui-absolute oui-inset-0 oui-z-10 oui-flex oui-items-center oui-justify-center">
            <Spinner />
          </div>
        )}
      </Flex>
    </OrderBookProvider>
  );
};
