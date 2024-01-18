import { FC, useContext, useMemo } from "react";
import { CellBar, CellBarDirection } from "../cellBar";
import { OrderBookContext } from "@/block/orderbook/orderContext";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { QtyMode } from "../types";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";
import { cn } from "@/utils";
import { OrderBookCellType } from "../types";



export interface DesktopOrderBookCellProps {
  background: string;
  price: number;
  quantity: number;
  // size: number;
  count: number;
  accumulated: number;
  type: OrderBookCellType;
  mode: QtyMode;
}

export const DesktopOrderBookCell: FC<DesktopOrderBookCellProps> = (props) => {
  const { cellHeight, showTotal, totalMode, depth } = useContext(OrderBookContext);
  const { base_dp, quote_dp } = useContext(SymbolContext);

  const width = (props.accumulated / props.count) * 100;


  console.log("cell height", cellHeight);

  const dp = useMemo(() => {
    return typeof depth === "number" ? getPrecisionByNumber(depth) : quote_dp;
  }, [depth, quote_dp]);

  const qty = Number.isNaN(props.quantity)
    ? "-"
    : new Decimal(props.quantity).mul(props.price).toString();

  return (
    <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-text-base-contrast-80 orderly-text-3xs orderly-gap-2 orderly-relative"
      style={{ height: `${cellHeight}px` }}
    >
      <div className={
        cn("orderly-basis-7/12 orderly-flex orderly-felx-row orderly-items-center",
          showTotal && "orderly-flex-1")
      }>
        <div className={cn(
          "orderly-flex-1 orderly-text-left",
          props.type === OrderBookCellType.ASK
            ? "orderly-text-trade-loss"
            : "orderly-text-trade-profit"
        )}>
          <Numeral precision={dp}>{props.price}</Numeral>
        </div>
        <div className="orderly-flex-1 orderly-text-right orderly-text-base-contrast-80">
          <Numeral precision={base_dp}>
            {props.quantity}
          </Numeral>
        </div>
      </div>
      <div className={cn(
        "orderly-basis-4/12 orderly-flex orderly-fex-row orderly-overflow-hidden orderly-relative",
        showTotal && "orderly-flex-1"
      )}>
        <div className="orderly-flex-1 orderly-text-right">

          <Numeral
            precision={base_dp}
            className="orderly-z-10 "
          >
            {props.accumulated}
          </Numeral>
        </div>
        {showTotal && (
          <div className="orderly-flex-1 orderly-text-right">

            <Numeral
              precision={2}
              className="orderly-z-10"
            >
              {qty}
            </Numeral>
          </div>
        )}
        <CellBar
          width={width}
          direction={CellBarDirection.LEFT_TO_RIGHT}
          className={
            props.type === OrderBookCellType.ASK
              ? "orderly-bg-trade-loss/20"
              : "orderly-bg-trade-profit/20"
          }
        />
      </div>

      <div
        className="orderly-absolute orderly-bg-red-300 orderly-rounded-full orderly-left-[-8px] orderly-h-[4px] orderly-w-[4px] orderly-pointer-events-none"
        style={{ top: `${cellHeight / 2 - 2}px` }}
      />
    </div>
  );
};