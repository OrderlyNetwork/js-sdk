import { OrderSide } from "@orderly.network/types";
import { Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { cn } from "@/utils/css";
import { commify } from "@orderly.network/utils";

export const OrderDetail = (props: {
  order: any;
  quote: string;
  className?: string;
}) => {
  const { order, quote } = props;
  const { side } = order;

  return (
    <div
      className={cn(
        "orderly-grid orderly-grid-cols-[1fr_2fr]",
        props.className
      )}
    >
      <div className="orderly-flex orderly-flex-col">
        <Text type={side === OrderSide.SELL ? "sell" : "buy"}>
          {side === OrderSide.SELL ? "Limit Sell" : "Limit Buy"}
        </Text>
      </div>
      <div className="orderly-space-y-2">
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Qty.</span>
          <Text type={side === OrderSide.SELL ? "sell" : "buy"}>
            {commify(order.order_quantity)}
          </Text>
        </div>
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Price</span>
          {/* <span>131311</span> */}
          <Text
            surfix={
              <span className="orderly-text-base-contrast-36">{quote}</span>
            }
          >
            {commify(order.order_price)}
          </Text>
        </div>
        <div className="orderly-flex orderly-justify-between">
          <span className="orderly-text-base-contrast-54">Total</span>
          <NumeralTotal
            quantity={order.order_quantity ?? 0}
            price={order.order_price ?? 0}
            surfix={
              <span className="orderly-text-base-contrast-36">{quote}</span>
            }
          />
        </div>
      </div>
    </div>
  );
};
