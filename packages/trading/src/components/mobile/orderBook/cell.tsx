import { FC, useContext, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { getPrecisionByNumber } from "@orderly.network/utils";
import { CellBar } from "../../base/orderBook/cellBar";
import {
  ORDERBOOK_MOBILE_COIN_TYPE_KEY,
  OrderBookContext,
} from "../../base/orderBook/orderContext";
import { OrderBookCellType, QtyMode } from "../../base/orderBook/types";

export interface OrderBookCellProps {
  background: string;
  price: number;
  quantity: number;
  accumulatedAmount: number;
  // size: number;
  count: number;
  accumulated: number;
  type: OrderBookCellType;
  mode: QtyMode;
}

export const OrderBookCell: FC<OrderBookCellProps> = (props) => {
  const { accumulated, count, quantity, price, type, accumulatedAmount } =
    props;

  const width = (accumulated / count) * 100;

  const { cellHeight, onItemClick, depth, symbolInfo } =
    useContext(OrderBookContext);

  const { base_dp, quote_dp, base, quote } = symbolInfo;

  const [coinTypeConfig, setCoinTypeConfig]: [string, React.Dispatch<string>] =
    useLocalStorage(ORDERBOOK_MOBILE_COIN_TYPE_KEY, ["total", base].join("_"));

  const [mode, currency] =
    (coinTypeConfig?.split("_") as [string, string]) ?? [];

  const totalAmount = Number.isNaN(accumulated)
    ? "-"
    : accumulatedAmount?.toString();

  const dp = useMemo(() => {
    return getPrecisionByNumber(depth || `${quote_dp}`);
  }, [depth, quote_dp]);

  return (
    <Box
      className={cn(
        "oui-relative oui-w-full oui-cursor-pointer oui-overflow-hidden oui-text-2xs oui-tabular-nums",
      )}
      style={{ height: `${cellHeight}px` }}
      onClick={() => {
        if (Number.isNaN(price) || Number.isNaN(quantity)) {
          return;
        }
        onItemClick?.([price, quantity]);
      }}
    >
      <Flex itemAlign="center" justify={"between"}>
        <Text.numeral
          color={type === OrderBookCellType.BID ? "buy" : "sell"}
          dp={dp}
        >
          {price}
        </Text.numeral>
        {mode === "qty" && (
          <Text.numeral className="oui-text-base-contrast-80" dp={base_dp}>
            {Number.isNaN(quantity) ? "-" : quantity}
          </Text.numeral>
        )}
        {mode === "total" && currency === base && (
          <Text.numeral className="oui-text-base-contrast-80" dp={base_dp}>
            {accumulated}
          </Text.numeral>
        )}
        {mode === "total" && currency === quote && (
          <Text.numeral className="oui-text-base-contrast-80" dp={0}>
            {totalAmount}
          </Text.numeral>
        )}
      </Flex>
      {Number.isNaN(width) ? null : (
        <CellBar
          width={width}
          className={cn(
            type === OrderBookCellType.ASK
              ? "oui-bg-trade-loss/20"
              : "oui-bg-trade-profit/20",
          )}
        />
      )}
    </Box>
  );
};
