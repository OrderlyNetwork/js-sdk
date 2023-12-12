import { FC } from "react";
import { ConfirmHeader } from "./confirmHeader";
import { ConfirmFooter } from "./confrimFooter";
import { OrderSide } from "@orderly.network/types";
import { NumeralTotal } from "@/text/numeralTotal";
import { Text } from "@/text";
import { Divider } from "@/divider";
import { NetworkImage } from "@/icon/networkImage";

export const LimitConfirmDialog: FC<{
  base: string;
  quantity: string;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  quote: string;
  order: any;
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
        {`You agree closing ${props.quantity} ${props.base} position at limit price.`}
      </div>
      <div className="orderly-text-base-contrast-54 orderly-text-2xs orderly-mt-3">
        Pending reduce-only orders might be cancelled or adjusted.
      </div>
      <Divider className="orderly-my-4" />

      <div className="orderly-flex orderly-mb-4 orderly-gap-2">
        <NetworkImage type="symbol" symbol={order.symbol} />
        <Text rule="symbol">{order.symbol}</Text>
      </div>
      <div className="orderly-grid orderly-grid-cols-[1fr_2fr] orderly-text-sm">
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
              surfix={
                <span className="orderly-text-base-contrast-36">{quote}</span>
              }
            >
              {order.order_price}
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
      <ConfirmFooter onCancel={onCancel} onConfirm={props.onConfirm} />
    </>
  );
};
