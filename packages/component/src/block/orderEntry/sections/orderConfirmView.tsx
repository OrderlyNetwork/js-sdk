import { OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { FC, useMemo } from "react";
import { Text } from "@/text";

interface OrderConfirmViewProps {
  order: OrderEntity;
  symbol: string;
  base: string;
  quote: string;
}

export const OrderConfirmView: FC<OrderConfirmViewProps> = (props) => {
  const { order, quote = "USDC", base } = props;

  const type = useMemo(() => {
    const type = order.order_type === OrderType.MARKET ? "Market" : "Limit";

    if (order.side === OrderSide.BUY) {
      return <Text type={"buy"}>{`${type} Buy`}</Text>;
    }
    return <Text type={"sell"}>{`${type} Sell`}</Text>;
  }, [order.side, order.order_type]);

  return (
    <div className="orderly-grid orderly-grid-cols-2 orderly-text-base-contract-54 orderly-text-xs desktop:orderly-text-sm">
      <div>
        <div className="desktop:orderly-flex desktop:orderly-justify-start">
          {type}
        </div>
        <div className="orderly-flex orderly-gap-1 orderly-items-end">
          <span>{base}</span>
          <span className="orderly-text-3xs orderly-text-base-contrast-54">
            /{quote}
          </span>
        </div>
      </div>
      <div className="orderly-flex orderly-flex-col orderly-gap-2">
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Qty.</span>
          <span>{order.order_quantity}</span>
        </div>
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Price</span>
          <span>
            {order.order_type === OrderType.MARKET
              ? "Market"
              : order.order_price}
          </span>
        </div>
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Total</span>
          <span>{order.total}</span>
        </div>
      </div>
    </div>
  );
};
