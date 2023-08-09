import { FC } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { DepthSelect } from "@/block/orderbook/depthSelect";
import { OrderBookProvider } from "@/block/orderbook/orderContext";

export interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: string;
  lastPrice: string;
  onItemClick?: (item: number[]) => void;
  depth: number[];
  onDepthChange?: (depth: number) => void;
  //
  autoSize?: boolean;
  level?: number;

  cellHeight?: number;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  return (
    <OrderBookProvider
      cellHeight={props.cellHeight ?? 22}
      onItemClick={props.onItemClick}
    >
      <Header priceUnit={"USDC"} qtyUnit={"BTC"} />
      <Asks data={props.asks} />
      <MarkPrice />
      <Bids data={props.bids} />
      <DepthSelect depth={props.depth} value={0.0001} />
    </OrderBookProvider>
  );
};
