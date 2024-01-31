import { FC, useContext, useMemo } from "react";
import { CellBar, CellBarDirection } from "./cellBar";
import { OrderBookContext } from "@/block/orderbook/orderContext";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { QtyMode } from "./types";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";
import { cn } from "@/utils";
import { OrderBookCellType } from "./types";

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
  const { cellHeight, onItemClick, depth, showTotal } =
    useContext(OrderBookContext);
  const { base_dp, quote_dp } = useContext(SymbolContext);

  let qty = Number.isNaN(props.quantity)
    ? "-"
    : props.mode === "amount"
    ? new Decimal(props.quantity).mul(props.price).toString()
    : props.quantity;

  if (showTotal) {
    qty = props.quantity;
  }

  const dp = useMemo(() => {
    return typeof depth === "number" ? getPrecisionByNumber(depth) : quote_dp;
  }, [depth, quote_dp]);

  return (
    <div
      className={cn(
        "orderly-order-book-list-item orderly-overflow-hidden orderly-relative orderly-cursor-pointer orderly-tabular-nums",
        showTotal && "orderly-flex-1"
      )}
      style={{ height: `${cellHeight}px` }}
      onClick={(e) => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;

        onItemClick?.([props.price, props.quantity]);
      }}
      // onMouseDown={(e) => {
      //   if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;
      //   e.stopPropagation();
      //   e.preventDefault();

      // }}
    >
      <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-items-center orderly-z-10 orderly-relative orderly-px-1 orderly-text-4xs desktop:orderly-text-2xs orderly-h-full">
        <div
          className={
            props.type === OrderBookCellType.ASK
              ? "orderly-text-trade-loss"
              : "orderly-text-trade-profit"
          }
        >
          <Numeral precision={dp}>{props.price}</Numeral>
        </div>
        <div className="orderly-text-base-contrast-80">
          <Numeral precision={props.mode === "amount" ? 2 : base_dp}>
            {qty}
          </Numeral>
        </div>
      </div>
      {Number.isNaN(width) || showTotal ? null : (
        <CellBar
          width={width}
          className={
            props.type === OrderBookCellType.ASK
              ? "orderly-bg-trade-loss/20"
              : "orderly-bg-trade-profit/20"
          }
        />
      )}
    </div>
  );
};
