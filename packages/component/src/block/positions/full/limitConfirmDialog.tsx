import { FC } from "react";
import { ConfirmHeader } from "./confirmHeader";
import { ConfirmFooter } from "./confrimFooter";
import { OrderSide } from "@orderly.network/types";
import { NumeralTotal } from "@/text/numeralTotal";
import { Text } from "@/text";
import { Divider } from "@/divider";
import { NetworkImage } from "@/icon/networkImage";
import { OrderDetail } from "../shared/orderDetail";
import { OrderEntity } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";

export const LimitConfirmDialog: FC<{
  base: string;
  quantity: string;
  onClose: () => void;
  onConfirm: () => void;
  quote: string;
  order: OrderEntity;
  submitting: boolean;
}> = (props) => {
  const { order, quote } = props;

  const { side } = order;
  const onCancel = () => {
    props.onClose();
  };
  return (
    <>
      <ConfirmHeader onClose={onCancel} title="Limit close" />
      <div className="orderly-text-base-contrast orderly-text-sm orderly-mt-5">
        {`You agree closing ${commify(props.quantity)} ${
          props.base
        } position at limit price.`}
      </div>
      {/* <div className="orderly-text-base-contrast-54 orderly-text-2xs orderly-mt-3">
        Pending reduce-only orders might be cancelled or adjusted.
      </div> */}
      <Divider className="orderly-my-4" />

      <div className="orderly-flex orderly-mb-4 orderly-gap-2">
        <NetworkImage type="symbol" symbol={order.symbol} />
        <Text rule="symbol">{order.symbol}</Text>
      </div>

      <OrderDetail
        className="orderly-text-sm"
        order={props.order}
        quote={props.quote}
      />
      <ConfirmFooter
        onCancel={onCancel}
        onConfirm={props.onConfirm}
        submitting={props.submitting}
      />
    </>
  );
};
