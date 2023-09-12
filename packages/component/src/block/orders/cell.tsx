import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useContext, useMemo } from "react";
import { Numeral } from "@/text/numeral";
import { API, OrderSide } from "@orderly.network/types";
import { Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { OrderListContext } from "./orderListContext";
import { SymbolContext } from "@/provider";

interface OrderCellProps {
  order: API.OrderExt;
}

export const OrderCell: FC<OrderCellProps> = (props) => {
  const { order } = props;

  const { onCancelOrder, onEditOrder } = useContext(OrderListContext);
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);

  const typeTag = useMemo(() => {
    return (
      <Tag color={order.side === "BUY" ? "buy" : "sell"} size="small">
        {order.side === "BUY" ? "Buy" : "Sell"}
      </Tag>
    );
  }, [order]);
  return (
    <div className={"px-4 py-2"}>
      <div className="flex items-center gap-2 mb-1">
        {typeTag}
        <div className="flex-1">
          <Text rule="symbol">{order.symbol}</Text>
        </div>
        <div className={"text-sm text-base-contrast/30"}>
          <Text rule="date">{order.created_time}</Text>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic
          label="Qty."
          value={order.quantity ?? "-"}
          precision={base_dp}
          rule="price"
          valueClassName={
            order.side === OrderSide.BUY
              ? "text-trade-profit"
              : "text-trade-loss"
          }
        />
        <Statistic
          label="Filled"
          value={order.executed ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          label="Est.Total(USDC)"
          value={
            <NumeralTotal
              price={props.order.price ?? 1}
              quantity={props.order.quantity}
              precision={quote_dp}
            />
          }
          align="right"
        />
        <Statistic
          label="Limit Price(USDC)"
          value={order.price ?? "-"}
          rule="price"
          precision={quote_dp}
        />
        <Statistic
          label="Mark Price(USDC)"
          rule="price"
          precision={quote_dp}
          value={order.mark_price}
        />
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <Button
          variant="outlined"
          size="small"
          color="tertiary"
          className="w-[120px]"
          onClick={() => onEditOrder(order)}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="tertiary"
          size="small"
          className="w-[120px]"
          onClick={() => onCancelOrder(order)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
