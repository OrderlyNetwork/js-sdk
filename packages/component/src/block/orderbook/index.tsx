import { FC, useCallback } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { DepthSelect } from "@/block/orderbook/depthSelect";
import { OrderBookProvider } from "@/block/orderbook/orderContext";
import { QtyMode } from "./types";

export interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: number;
  lastPrice: number;
  onItemClick?: (item: number[]) => void;
  depth: number[];
  onDepthChange?: (depth: number) => void;
  //
  autoSize?: boolean;
  level?: number;
  base: string;
  quote: string;

  cellHeight?: number;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  const { lastPrice, markPrice, quote, base } = props;
  // const onModeChange = useCallback((mode: QtyMode) => {}, []);

  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 22}
      onItemClick={props.onItemClick}
    >
      <Header quote={quote} base={base} />
      <Asks data={props.asks} />
      <MarkPrice lastPrice={lastPrice} markPrice={markPrice} />
      <Bids data={props.bids} />
      <DepthSelect depth={props.depth} value={0.0001} />
    </OrderBookProvider>
  );
};
