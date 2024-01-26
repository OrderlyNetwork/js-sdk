import { OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { FC, useMemo } from "react";
import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { Checkbox } from "@/checkbox";
import { useLocalStorage } from "@orderly.network/hooks";
import { Label } from "@/label";

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

  const priceNode = useMemo(() => {
    if (order.order_type === OrderType.MARKET) {
      return <span>Market</span>
    }
    return (
      <div className="orderly-inline-block">
        <span>{order.order_price}</span>
        <span className="orderly-text-base-contrast-36 orderly-ml-1">{quote}</span>
      </div>
    );
  }, [order]);

  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );
  const ordefConfirmCheckBox = useMemo(() => {

    return (
      <div className={"orderly-flex orderly-items-center orderly-gap-2"}>
        <Checkbox
          id="orderConfirm"
          checked={!needConfirm}
          onCheckedChange={(checked) => {
            console.log("checked", checked);
            
            setNeedConfirm(!!!checked);
          }}
        />
        <Label
          htmlFor={"showAll"}
          className="orderly-text-base-contrast-54 orderly-text-3xs"
        >
          Disable order confirmation
        </Label>
      </div>
    );
  }, [order,needConfirm]);

  return (
    <div>
      <div className="orderly-flex orderly-items-center orderly-pb-4">
        <NetworkImage symbol={props.symbol} type="symbol" size={20} />
        <span className="orderly-text-lg orderly-pl-2">
          {`${base}-PERP`}
        </span>
      </div>
      <div className="orderly-grid orderly-grid-cols-2 orderly-text-base-contract-54 orderly-text-xs desktop:orderly-text-sm">
        <div>
          <div className="desktop:orderly-flex desktop:orderly-justify-start">{type}</div>
          <div className="orderly-flex orderly-gap-1 orderly-items-end">
            <span>{base}</span>
            <span className="orderly-text-3xs orderly-text-base-contrast-54">/{quote}</span>
          </div>
        </div>
        <div className="orderly-flex orderly-flex-col orderly-gap-2">
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Qty.</span>
            <span>{order.order_quantity}</span>
          </div>
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Trigger price</span>
            <div className="orderly-inline-block">
              <span>{order.order_price}</span>
              <span className="orderly-text-base-contrast-36 orderly-ml-1">{quote}</span>
            </div>
          </div>
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Price</span>
            {priceNode}
          </div>
          <div className="orderly-flex orderly-justify-between">
            <span className="orderly-text-base-contrast-54">Total</span>
            <div className="orderly-inline-block">
              <span>{order.total}</span>
              <span className="orderly-text-base-contrast-36 orderly-ml-1">{quote}</span>
            </div>
          </div>
        </div>
      </div>
{ordefConfirmCheckBox}
    </div>
  );
};

/**
 * <NetworkImage symbol={symbol} type="symbol" size={20} />
      <span className="orderly-text-lg orderly-pl-2">
        {`${base}-PERP`}
      </span>
 */