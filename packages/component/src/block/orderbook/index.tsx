import { FC } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";
import { DepthSelect } from "@/block/orderbook/depthSelect";

export interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: string;
  lastPrice: string;
  onItemClick?: () => void;
  depth: number[];
  onDepthChange?: (depth: number) => void;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  return (
    <div>
      <Header priceUnit={"USDC"} qtyUnit={"BTC"} />
      <Bids data={[]} />
      <MarkPrice />
      <Asks data={[]} />
      <DepthSelect depth={props.depth} value={0.0001} />
    </div>
  );
};
