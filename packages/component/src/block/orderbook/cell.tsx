import { FC, useContext, useMemo } from "react";
import { CellBar, CellBarDirection } from "./cellBar";
import { OrderBookContext } from "@/block/orderbook/orderContext";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { QtyMode } from "./types";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";
import { cn } from "@/utils";

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

  const { cellHeight, showTotal, totalMode } = useContext(OrderBookContext);
  const { base_dp, quote_dp } = useContext(SymbolContext);

  if (showTotal == false) {
    return (
      <MobileOrderBookCell
        background={props.background}
        price={props.price}
        quantity={props.quantity}
        accumulated={props.accumulated}
        count={props.count}
        type={props.type}
        mode={props.mode} />
    );

  }

  const width = (props.accumulated / props.count) * 100;

  let qty = Number.isNaN(props.quantity)
    ? "-"
    : totalMode === "amount"
      ? new Decimal(props.quantity).mul(props.price).toString()
      : props.accumulated;


  return (
    <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-text-base-contrast-80 orderly-text-3xs orderly-gap-2">
      <MobileOrderBookCell
        background={props.background}
        price={props.price}
        quantity={props.quantity}
        accumulated={props.accumulated}
        count={props.count}
        type={props.type}
        mode={props.mode} />
      {showTotal && (<div
        className="orderly-order-book-list-item orderly-overflow-hidden orderly-relative orderly-cursor-pointer orderly-tabular-nums orderly-flex-[0.7]"
        style={{ height: `${cellHeight}px` }}
      >
        <Numeral precision={props.mode === "amount" ? 2 : base_dp} className="orderly-z-10">
          {qty}
        </Numeral>

        <CellBar
          width={width}
          direction={CellBarDirection.LEFT_TO_RIGHT}
          className={
            props.type === OrderBookCellType.ASK
              ? "orderly-bg-trade-loss/20"
              : "orderly-bg-trade-profit/20"
          }
        />
      </div>)}
    </div>
  );
};

const MobileOrderBookCell: FC<OrderBookCellProps> = (props) => {
  const width = (props.accumulated / props.count) * 100;
  const { cellHeight, onItemClick, depth, showTotal } = useContext(OrderBookContext);
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
      className="orderly-order-book-list-item orderly-overflow-hidden orderly-relative orderly-cursor-pointer orderly-tabular-nums orderly-flex-1"
      style={{ height: `${cellHeight}px` }}
      onClick={() => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;
        onItemClick?.([props.price, props.quantity]);
      }}
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
