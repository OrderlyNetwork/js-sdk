import { FC } from "react";
import { CellBar } from "./cellBar";

export enum OrderBookCellType {
  BID = "bid",
  ASK = "ask",
}

export interface OrderBookCellProps {
  background: string;
  price: string;
  quantity: string;
  size: number;
}

export const OrderBookCell: FC<OrderBookCellProps> = (props) => {
  return (
    <div className="overflow-hidden relative">
      <div className="flex flex-row justify-between z-10 relative">
        <div>{props.price}</div>
        <div>{props.quantity}</div>
      </div>
      <CellBar width={props.size} />
    </div>
  );
};
