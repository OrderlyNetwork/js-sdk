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

  console.log("order", props);

  const type = useMemo(() => {
    const type = order.order_type === OrderType.MARKET ? "Market" : "Limit";

    if (order.side === OrderSide.BUY) {
      return <Text type={"buy"}>{`${type} Buy`}</Text>;
    }
    return <Text type={"sell"}>{`${type} Sell`}</Text>;
  }, [order.side, order.order_type]);

  return (
    <div className="grid grid-cols-2 text-base">
      <div>
        <div>{type}</div>
        <div className="flex gap-1 items-end">
          <span>{base}</span>
          <span className="text-sm text-base-contrast/50">/USDT</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between ">
          <span className="text-base-contrast/50">Qty.</span>
          <span>{order.order_quantity}</span>
        </div>
        <div className="flex justify-between ">
          <span className="text-base-contrast/50">Price</span>
          <span>
            {order.order_type === OrderType.MARKET
              ? "Market"
              : order.order_price}
          </span>
        </div>
        <div className="flex justify-between ">
          <span className="text-base-contrast/50">Total</span>
          <span>{order.total}</span>
        </div>
      </div>
    </div>
  );
};
