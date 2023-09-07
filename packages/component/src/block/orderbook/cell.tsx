import { FC, useContext, useMemo } from "react";
import { CellBar } from "./cellBar";
import { OrderBookContext } from "@/block/orderbook/orderContext";
import { Decimal } from "@orderly.network/utils";
import { QtyMode } from "./types";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";

export enum OrderBookCellType {
  BID = "bid",
  ASK = "ask",
}

export interface OrderBookCellProps {
  background: string;
  price: number;
  quantity: number;
  // size: number;
  count: number;
  accumulated: number;
  type: OrderBookCellType;
  mode: QtyMode;
}

export const OrderBookCell: FC<OrderBookCellProps> = (props) => {
  const width = (props.accumulated / props.count) * 100;
  const { cellHeight, onItemClick } = useContext(OrderBookContext);
  const { base_dp, quote_dp } = useContext(SymbolContext);

  const qty = Number.isNaN(props.quantity)
    ? "-"
    : props.mode === "amount"
    ? new Decimal(props.quantity).mul(props.price).toString()
    : props.quantity;

  return (
    <div
      className="overflow-hidden relative cursor-pointer "
      style={{ height: `${cellHeight}px` }}
      onClick={() => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;
        onItemClick?.([props.price, props.quantity]);
      }}
    >
      <div className="flex flex-row justify-between items-center z-10 relative px-1 text-[12px] h-full">
        <div
          className={
            props.type === OrderBookCellType.ASK
              ? "text-trade-loss"
              : "text-trade-profit"
          }
        >
          <Numeral precision={quote_dp}>{props.price}</Numeral>
        </div>
        <div className={"text-base-contrast/70"}>
          <Numeral precision={props.mode === "amount" ? quote_dp : base_dp}>
            {qty}
          </Numeral>
        </div>
      </div>
      {Number.isNaN(width) ? null : (
        <CellBar
          width={width}
          className={
            props.type === OrderBookCellType.ASK
              ? "bg-trade-loss/20"
              : "bg-trade-profit/20"
          }
        />
      )}
    </div>
  );
};
