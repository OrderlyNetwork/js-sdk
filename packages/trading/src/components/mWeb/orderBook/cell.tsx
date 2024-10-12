import { FC, useContext, useMemo } from "react";
import { CellBar } from "../../base/orderBook/cellBar";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { OrderBookCellType, QtyMode } from "../../base/orderBook/types";
import { OrderBookContext } from "../../base/orderBook/orderContext";
import { Box, cn, Flex, Text } from "@orderly.network/ui";

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
  const { cellHeight, onItemClick, depth, showTotal, symbolInfo } =
    useContext(OrderBookContext);
  const { base_dp, quote_dp } = symbolInfo;

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
    <Box
      className={cn(
        "oui-overflow-hidden oui-relative oui-cursor-pointer oui-tabular-nums oui-text-2xs oui-w-full",
        showTotal && "oui-flex-1"
      )}
      style={{ height: `${cellHeight}px` }}
      onClick={(e) => {
        if (Number.isNaN(props.price) || Number.isNaN(props.quantity)) return;

        onItemClick?.([props.price, props.quantity]);
      }}
    >
      <Flex justify={"between"}>
        <Text.numeral
          color={props.type === OrderBookCellType.BID ? "buy" : "sell"}
          dp={dp}
        >
          {props.price}
        </Text.numeral>
        <Text.numeral
          dp={props.mode === "amount" ? 2 : base_dp}
          className="oui-text-base-contrast-80"
        >
          {qty}
        </Text.numeral>
      </Flex>
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
    </Box>
  );
};
