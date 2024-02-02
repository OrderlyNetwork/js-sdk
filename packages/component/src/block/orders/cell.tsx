import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Numeral } from "@/text/numeral";
import { API, OrderSide } from "@orderly.network/types";
import { Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { OrderListContext } from "./shared/orderListContext";
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
    <div className="orderly-px-4 orderly-py-2">
      <div className="orderly-flex orderly-items-center orderly-gap-2 orderly-mb-1">
        {typeTag}
        <div className="orderly-flex-1 orderly-text-2xs" onClick={onSymbol}>
          <Text rule="symbol">{order.symbol}</Text>
        </div>
        <div className="orderly-text-4xs orderly-text-base-contrast-36">
          <Text rule="date">{order.created_time}</Text>
        </div>
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2">
        <Statistic
          label="Qty."
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          value={order.quantity ?? "-"}
          precision={base_dp}
          rule="price"
          valueClassName={
            order.side === OrderSide.BUY
              ? "orderly-text-trade-profit orderly-text-3xs"
              : "orderly-text-trade-loss orderly-text-3xs"
          }
        />
        <Statistic
          label="Filled"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          value={order.executed ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          label={
            <>
              <span className="orderly-text-base-contrast-36">Est. total</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
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
              <span className="orderly-text-base-contrast-36">Limit price</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          value={order.price ?? "-"}
          rule="price"
          precision={quote_dp}
        />
        <Statistic
          label={
            <>
              <span className="orderly-text-base-contrast-36">Mark price</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          value={order.mark_price}
        />
        <Statistic
          label={
            <>
              <span className="orderly-text-base-contrast-36">Trigger price</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          value={order.trigger_price}
        />
      </div>
      <div className="orderly-flex orderly-gap-3 orderly-text-4xs orderly-justify-end orderly-mt-2">
        <Button
          id="orderly-pending-cell-edit-button"
          variant="outlined"
          size="small"
          color="tertiary"
          className="orderly-w-[120px] orderly-text-4xs"
          onClick={() => onEditOrder(order)}
        >
          Edit
        </Button>
        <Button
          id="orderly-pending-cell-cancel-button"
          variant="outlined"
          color="tertiary"
          size="small"
          className="orderly-w-[120px] orderly-text-4xs"
          loading={loading}
          onClick={cancelOrder}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
