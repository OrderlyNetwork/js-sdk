import { FC, useMemo } from "react";
import { getPrecisionByNumber } from "@orderly.network/utils";
import { cn, Divider, parseNumber, Text } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookCellType } from "../../base/orderBook/types";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { CellBar, CellBarDirection } from "../../base/orderBook/cellBar";

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
  symbolInfo: BasicSymbolInfo;

  isHover: boolean;
  currentHover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const DesktopOrderBookCell: FC<DesktopOrderBookCellProps> = (props) => {
  const { cellHeight, showTotal, onItemClick, depth, pendingOrders } =
    useOrderBookContext();
  const { symbolInfo, currentHover } = props;
  const { base_dp, quote_dp } = symbolInfo;

  const width = Number.isNaN(props.price)
    ? 0
    : (props.accumulated / props.count) * 100;

  const dp = useMemo(() => {
    return getPrecisionByNumber(depth || `${quote_dp}`);
  }, [depth, quote_dp]);

  const totalAmount = Number.isNaN(props.accumulated)
    ? "-"
    : props.accumulatedAmount?.toString();

  const isPendingOrder = useMemo(() => {
    const priceStr = parseNumber(props.price, { dp: dp, padding: true });
    return pendingOrders.some(
      (item) => priceStr === parseNumber(item, { dp: dp, padding: true })
    );
  }, [pendingOrders, props.price, dp]);

  return (
    <div
      className="oui-flex oui-flex-row oui-pl-3 oui-tabular-nums oui-justify-between oui-text-base-contrast-80 oui-text-xs oui-relative oui-cursor-pointer"
      style={{ height: `${cellHeight}px` }}
      onClick={() => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;
        onItemClick?.([props.price, props.quantity]);
      }}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <div
        className={cn(
          "oui-basis-7/12 oui-flex oui-flex-row oui-items-center oui-mr-2",
          showTotal && "oui-basis-5/12"
        )}
      >
        <div
          className={cn(
            "oui-flex-1 oui-text-left",
            props.type === OrderBookCellType.ASK
              ? "oui-text-trade-loss"
              : "oui-text-trade-profit"
          )}
        >
          <Text.numeral dp={dp}>{props.price}</Text.numeral>
        </div>
        <div className="oui-flex-1 oui-text-right oui-text-base-contrast-80">
          <Text.numeral dp={base_dp}>{props.quantity}</Text.numeral>
        </div>
      </div>
      <div
        className={cn(
          "oui-basis-5/12 oui-flex oui-items-center oui-fex-row oui-overflow-hidden oui-relative oui-justify-end",
          showTotal && "oui-basis-7/12"
        )}
      >
        <div
          className={cn(
            "oui-flex-1 oui-pr-3 oui-text-right",
            showTotal && "oui-pr-3"
          )}
        >
          <Text.numeral dp={base_dp} className="oui-z-10">
            {props.accumulated}
          </Text.numeral>
        </div>
        {showTotal && (
          <div className="oui-flex-1 oui-text-right oui-pr-3">
            <Text.numeral dp={2} className="oui-z-10">
              {totalAmount}
            </Text.numeral>
          </div>
        )}
        <CellBar
          width={width}
          direction={CellBarDirection.LEFT_TO_RIGHT}
          className={
            props.type === OrderBookCellType.ASK
              ? "oui-bg-trade-loss/10"
              : "oui-bg-trade-profit/10"
          }
        />
      </div>

      {isPendingOrder && (
        <div
          className={cn(
            "oui-absolute oui-rounded-full oui-left-[4px] oui-h-[4px] oui-w-[4px] oui-pointer-events-none",
            props.type === OrderBookCellType.ASK && "oui-bg-trade-loss",
            props.type === OrderBookCellType.BID && "oui-bg-trade-profit"
          )}
          style={{ top: `${cellHeight / 2 - 2}px` }}
        />
      )}

      {props.isHover && (
        <div className="oui-absolute oui-bg-white oui-left-0 oui-right-0 oui-top-0 oui-bottom-0 oui-opacity-[.12]"></div>
      )}
      {currentHover && (
        <div
          className={cn(
            "oui-absolute oui-left-0 oui-right-0",
            props.type === OrderBookCellType.ASK && "oui-top-0",
            props.type === OrderBookCellType.BID && "oui-bottom-0"
          )}
        >
          <Divider
            lineStyle="dashed"
            className={cn(
              "oui-w-full",
              props.type === OrderBookCellType.BID && "oui-border-trade-profit",
              props.type === OrderBookCellType.ASK && "oui-border-trade-loss"
            )}
          />
        </div>
      )}
    </div>
  );
};
