import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Numeral } from "@/text/numeral";
import { API, OrderSide } from "@orderly.network/types";
import { Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { OrderListContext } from "./orderListContext";
import { SymbolContext } from "@/provider";

interface OrderCellProps {
  order: API.OrderExt;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const OrderCell: FC<OrderCellProps> = (props) => {
  const { order } = props;
  const [loading, setLoading] = useState(false);

  const { onCancelOrder, onEditOrder } = useContext(OrderListContext);
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);

  const typeTag = useMemo(() => {
    return (
      <Tag color={order.side === "BUY" ? "buy" : "sell"} size="small">
        {order.side === "BUY" ? "Buy" : "Sell"}
      </Tag>
    );
  }, [order]);

  const cancelOrder = useCallback(() => {
    if (loading) return;
    setLoading(true);
    onCancelOrder(order).finally(() => setLoading(false));
  }, [loading, order]);

  const onSymbol = () => {
    props.onSymbolChange?.({ symbol: order.symbol } as API.Symbol);
    // go to the top of page
    window.scrollTo(0, 0);
  };

  return (
    <div className={"px-4 py-2"}>
      <div className="flex items-center gap-2 mb-1">
        {typeTag}
        <div className="flex-1 text-2xs" onClick={onSymbol}>
          <Text rule="symbol">{order.symbol}</Text>
        </div>
        <div className={"text-4xs text-base-contrast-36"}>
          <Text rule="date">{order.created_time}</Text>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic
          label="Qty."
          labelClassName="text-4xs text-base-contrast-36"
          value={order.quantity ?? "-"}
          precision={base_dp}
          rule="price"
          valueClassName={
            order.side === OrderSide.BUY
              ? "text-trade-profit text-3xs"
              : "text-trade-loss text-3xs"
          }
        />
        <Statistic
          label="Filled"
          labelClassName="text-4xs text-base-contrast-36"
          valueClassName={"text-3xs text-base-contrast-80"}
          value={order.executed ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          label={
            <>
              <span className="text-base-contrast-36">Est. total</span>
              <span className="text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="text-4xs text-base-contrast-36"
          valueClassName={"text-3xs text-base-contrast-80"}
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
          label={
            <>
              <span className="text-base-contrast-36">Limit price</span>
              <span className="text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="text-4xs text-base-contrast-36"
          valueClassName={"text-3xs text-base-contrast-80"}
          value={order.price ?? "-"}
          rule="price"
          precision={quote_dp}
        />
        <Statistic
          label={
            <>
              <span className="text-base-contrast-36">Mark price</span>
              <span className="text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="text-4xs text-base-contrast-36"
          valueClassName={"text-3xs text-base-contrast-80"}
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
          loading={loading}
          onClick={cancelOrder}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
