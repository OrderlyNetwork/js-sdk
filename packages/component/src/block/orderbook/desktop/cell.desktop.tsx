import { FC, useContext, useMemo } from "react";
import { CellBar, CellBarDirection } from "../cellBar";
import { OrderBookContext } from "@/block/orderbook/orderContext";
import { getPrecisionByNumber, } from "@orderly.network/utils";
import { parseNumber } from "@/utils/num";
import { QtyMode } from "../types";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";
import { cn } from "@/utils";
import { OrderBookCellType } from "../types";




export interface DesktopOrderBookCellProps {
  background: string;
  maxQty: number;
  price: number;
  quantity: number;
  // size: number;
  count: number;
  accumulated: number;
  accumulatedAmount: number;
  type: OrderBookCellType;
  
  isHover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const DesktopOrderBookCell: FC<DesktopOrderBookCellProps> = (props) => {
  const { cellHeight, showTotal, onItemClick, depth, pendingOrders } = useContext(OrderBookContext);
  const { base_dp, quote_dp } = useContext(SymbolContext);

  const width = Number.isNaN(props.price) ? 0 : (props.accumulated / props.count) * 100;



  const dp = useMemo(() => {
    return typeof depth === "number" ? getPrecisionByNumber(depth) : quote_dp;
  }, [depth, quote_dp]);

  const totalAmount = Number.isNaN(props.accumulated)
    ? "-"
    : props.accumulatedAmount?.toString();

  const isPendingOrder = useMemo(() => {
    const priceStr = parseNumber(props.price, { precision: dp, padding: true, });
    const index = pendingOrders.findIndex((item) => priceStr === parseNumber(item, { precision: dp, padding: true }));

    return index !== -1;
  }, [pendingOrders, props.price, depth]);

  return (
    <div className="orderly-flex orderly-flex-row orderly-tabular-nums orderly-justify-between orderly-text-base-contrast-80 orderly-text-3xs orderly-relative orderly-cursor-pointer"
      style={{ height: `${cellHeight}px` }}
      onClick={() => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;
        onItemClick?.([props.price, props.quantity]);
      }}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <div className={
        cn("orderly-basis-7/12 orderly-flex orderly-felx-row orderly-items-center orderly-mr-2",
          showTotal && "orderly-basis-5/12")
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
        "orderly-basis-5/12 orderly-flex orderly-items-center orderly-fex-row orderly-overflow-hidden orderly-relative",
        showTotal && "orderly-basis-7/12"
      )}>
        <div className={cn(
          "orderly-flex-1 orderly-pr-6 orderly-text-right",
          showTotal && "orderly-pr-3",
        )}>

          <Numeral
            precision={base_dp}
            className="orderly-z-10 "
          >
            {props.accumulated}
          </Numeral>
        </div>
        {showTotal && (
          <div className="orderly-flex-1 orderly-text-right orderly-pr-3">

            <Numeral
              precision={2}
              className="orderly-z-10"
            >
              {totalAmount}
            </Numeral>
          </div>
        )}
        <CellBar
          width={width}
          direction={CellBarDirection.LEFT_TO_RIGHT}
          className={
            props.type === OrderBookCellType.ASK
              ? "orderly-bg-trade-loss/10"
              : "orderly-bg-trade-profit/10"
          }
        />
      </div>

      {isPendingOrder && <div
        className={cn(
          "orderly-absolute orderly-rounded-full orderly-left-[-8px] orderly-h-[4px] orderly-w-[4px] orderly-pointer-events-none",
          props.type === OrderBookCellType.ASK && "orderly-bg-trade-loss",
          props.type === OrderBookCellType.BID && "orderly-bg-trade-profit",
        )}
        style={{ top: `${cellHeight / 2 - 2}px` }}
      />}

    {props.isHover && <div className="orderly-absolute orderly-bg-white orderly-left-0 orderly-right-0 orderly-top-0 orderly-bottom-0 orderly-opacity-10"></div>}
    </div>
  );
};