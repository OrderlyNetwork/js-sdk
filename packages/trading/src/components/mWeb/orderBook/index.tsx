import { FC} from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { OrderBookProvider } from "../../base/orderBook/orderContext";
import { DepthSelect } from "./depthSelect";
import { cn, Flex, Spinner } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { FundingRateWidget } from "../fundingRate";
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
  tabletMediaQuery: string;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base, isLoading, onDepthChange } = props;
  // const onModeChange = useCallback((mode: QtyMode) => {}, []);
  const symbol = `PERP_${props.symbolInfo.base}_${props.symbolInfo.quote}`;

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 20}
      onItemClick={props.onItemClick}
      depth={props.activeDepth}
      pendingOrders={[]}
      showTotal={false}
      symbolInfo={props.symbolInfo}
      tabletMediaQuery={props.tabletMediaQuery}
    >
      <Flex
        direction={"column"}
        p={2}
        id="oui-orderbook-mobile"
        className={cn("oui-h-full oui-wfull oui-relative", props.className)}
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
          <div className="oui-absolute oui-left-0 oui-top-0 oui-right-0 oui-bottom-0 oui-z-10 oui-flex oui-items-center oui-justify-center oui-bg-base-800/70 oui-h-full oui-min-h-[420px]">
            <Spinner />
          </div>
        )}
      </Flex>
    </OrderBookProvider>
  );
};
