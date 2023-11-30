import { Divider } from "@/divider";
import { NetworkImage } from "@/icon";
import { Numeral, Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { API, OrderEntity, OrderSide } from "@orderly.network/types";
import { FC } from "react";

interface Props {
  order: OrderEntity;
  base: string;
  quote: string;
  side: OrderSide;
}

export const LimitConfirm: FC<Props> = (props) => {
  const { order, quote, side } = props;

  return (
    <div>
      <div className="orderly-space-y-3">
        <div className="orderly-font-medium orderly-text-base-contrast-54 orderly-text-2xs">
          {`You will close ${order.order_quantity} ETH position at limit price.`}
        </div>
      </div>
      <Divider className="orderly-my-4" />
      <div className="orderly-mb-4 orderly-flex orderly-text-base orderly-items-center orderly-gap-2">
        <NetworkImage size={20} type={"token"} name={"ETH"} />
        <Text rule="symbol" className="orderly-text-base">
          {order.symbol}
        </Text>
      </div>
      <div className="orderly-grid orderly-grid-cols-[1fr_2fr] orderly-text-xs">
        <div className="orderly-flex orderly-flex-col">
          <Text type={side === OrderSide.SELL ? "sell" : "buy"}>
            {side === OrderSide.SELL ? "Limit Sell" : "Limit Buy"}
          </Text>
        </div>
        <div className="orderly-space-y-2">
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Qty.</span>
            <Text type={side === OrderSide.SELL ? "sell" : "buy"}>
              {order.order_quantity}
            </Text>
          </div>
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Price</span>
            {/* <span>131311</span> */}
            <Text
              surfix={<span className="orderly-text-base-contrast-36">{quote}</span>}
            >
              {order.order_price}
            </Text>
          </div>
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Total</span>
            <NumeralTotal
              quantity={order.order_quantity ?? 0}
              price={order.order_price ?? 0}
              surfix={<span className="orderly-text-base-contrast-36">{quote}</span>}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
