import { FC } from "react";
import { Header } from "./header";
import { Bids } from "./bids";
import { Asks } from "./asks";
import { MarkPrice } from "./markPrice";

interface OrderBookProps {
  asks: any[];
  bids: any[];
  markPrice: string;
  lastPrice: string;
}

export const OrderBook: FC<OrderBookProps> = (props) => {
  return (
    <div>
      <Header />
      <Bids />
      <MarkPrice />
      <Asks />
    </div>
  );
};
