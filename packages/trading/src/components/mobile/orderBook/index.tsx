import { FC, useEffect } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { cn, Flex, Spinner } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import {
  ORDERBOOK_MOBILE_COIN_TYPE_KEY,
  OrderBookProvider,
} from "../../base/orderBook/orderContext";
import { FundingRateWidget } from "../fundingRate";
import { Asks } from "./asks";
import { Bids } from "./bids";
import { DepthSelect } from "./depthSelect";
import { Header } from "./header";
import { MarkPrice } from "./markPrice";

export interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number[];
  onItemClick?: (item: number[]) => void;
  depths?: string[];
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
  symbolInfo: BasicSymbolInfo;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;

  const symbol = `PERP_${props.symbolInfo.base}_${props.symbolInfo.quote}`;

  const [coinType, setCoinType] = useLocalStorage(
    ORDERBOOK_MOBILE_COIN_TYPE_KEY,
    base,
  );

  useEffect(() => {
    if (coinType !== quote && base) {
      setCoinType(base);
    }
  }, [base, quote]);

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 20}
      onItemClick={props.onItemClick}
      depth={props.activeDepth}
      pendingOrders={[]}
      showTotal={false}
      symbolInfo={props.symbolInfo}
    >
      <Flex
        direction={"column"}
        p={2}
        id="oui-orderbook-mobile"
        className={cn("oui-relative oui-size-full", props.className)}
        justify={"start"}
        itemAlign={"start"}
      >
        <FundingRateWidget symbol={symbol} />
        <Header quote={quote} base={base} />
        <Asks data={props.asks} />
        <MarkPrice lastPrice={lastPrice} markPrice={markPrice} />
        <Bids data={props.bids} />
        <DepthSelect
          depth={props.depths || []}
          value={props.activeDepth}
          onChange={onDepthChange}
        />
        {isLoading && (
          <div className="oui-bg-base-800/70 oui-absolute oui-inset-0 oui-z-10 oui-flex oui-h-full oui-min-h-[420px] oui-items-center oui-justify-center">
            <Spinner />
          </div>
        )}
      </Flex>
    </OrderBookProvider>
  );
};
