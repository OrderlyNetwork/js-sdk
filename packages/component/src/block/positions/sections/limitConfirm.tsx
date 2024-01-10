import { Divider } from "@/divider";
import { NetworkImage } from "@/icon";
import { Numeral, Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { API, OrderEntity, OrderSide } from "@orderly.network/types";
import { FC } from "react";
import { OrderDetail } from "../shared/orderDetail";

interface Props {
  order: OrderEntity;
  base: string;
  quote: string;
  side: OrderSide;
}

export const LimitConfirm: FC<Props> = (props) => {
  const { order, quote, side } = props;

  console.log("LimitConfirm::::::::", props);

  return (
    <div>
      <div className="orderly-space-y-3">
        <div className="orderly-font-medium orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          {`You will close ${order.order_quantity} ${props.base} position at limit price.`}
        </div>
      </div>
      <Divider className="orderly-my-4" />
      <div className="orderly-mb-4 orderly-flex orderly-text-base orderly-items-center orderly-gap-2">
        <NetworkImage size={20} type={"token"} name={props.base} />
        <Text
          rule="symbol"
          className="orderly-text-base desktop:orderly-text-lg"
        >
          {order.symbol}
        </Text>
      </div>
      <OrderDetail
        className="orderly-text-xs"
        order={props.order}
        quote={props.quote}
      />
    </div>
  );
};
