import { FC, useContext, useMemo } from "react";
import { CellBar, CellBarDirection } from "../cellBar";
import { Decimal, getPrecisionByNumber, removeTrailingZeros } from "@orderly.network/utils";
import { OrderBookCellType, QtyMode } from "../types";
import { OrderBookContext } from "../orderContext";
import { useTradingPateContext } from "../../../provider/context";
import { cn, Text } from "@orderly.network/ui";

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
  const { base_dp, quote_dp } = useTradingPateContext().symbolInfo;

  let qty = Number.isNaN(props.quantity)
    ? "-"
    : props.mode === "amount"
    ? new Decimal(props.quantity).mul(props.price).toString()
    : props.quantity;

  if (showTotal) {
    qty = props.quantity;
  }

  const dp = useMemo(() => {
    return getPrecisionByNumber(depth || `${quote_dp}`);
  }, [depth, quote_dp]);

  return (
    <div
      className={cn(
        "oui-order-book-list-item oui-overflow-hidden oui-relative oui-cursor-pointer oui-tabular-nums",
        showTotal && "oui-flex-1"
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
      <div className="oui-flex oui-flex-row oui-justify-between oui-items-center oui-z-10 oui-relative oui-px-1 oui-text-4xs desktop:oui-text-2xs oui-h-full">
        <div
          className={
            props.type === OrderBookCellType.ASK
              ? "oui-text-trade-loss"
              : "oui-text-trade-profit"
          }
        >
          <Text.numeral dp={dp}>{props.price}</Text.numeral>
        </div>
        <div className="oui-text-base-contrast-80">
          <Text.numeral dp={props.mode === "amount" ? 2 : base_dp}>
            {qty}
          </Text.numeral>
        </div>
      </div>
      {Number.isNaN(width) || showTotal ? null : (
        <CellBar
          width={width}
          className={
            props.type === OrderBookCellType.ASK
              ? "oui-bg-trade-loss/20"
              : "oui-bg-trade-profit/20"
          }
        />
      )}
    </div>
  );
};
