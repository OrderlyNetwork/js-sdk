import { NetworkImage } from "@/icon";
import { Numeral } from "@/text";
import { cn } from "@/utils";
import { OrderEntity } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
import { FC } from "react";

export const EditOrderConfirmContent = (
  isAlgoOrder: boolean,
  isMarketOrder: boolean,
  data: OrderEntity,
  dirtyFields: Partial<OrderEntity>,
  base: string,
  symbol: string,
) => {
  // if (isAlgoOrder) {
    return <AlgoContent
      data={data}
      dirtyFields={dirtyFields}
      base={base}
      symbol={symbol}
      isMarketOrder={isMarketOrder}
      isAlgoOrder={isAlgoOrder}
    />
  // }
  // return (<NormalContent
  //   data={data}
  //   dirtyFields={dirtyFields}
  //   base={base}
  // />);
};


const NormalContent: FC<{
  data: OrderEntity,
  dirtyFields: Partial<OrderEntity>,
  base: string
}> = (props) => {

  const { data, dirtyFields, base } = props;

  let confirmText;

  if (dirtyFields["order_price"] && dirtyFields["order_quantity"]) {
    confirmText = (
      <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
        You agree changing the price of {base}-PERP order to{" "}
        <span className="orderly-text-warning">
          {commify(data.order_price!)}
        </span>{" "}
        and the quantity to{" "}
        <span className="orderly-text-warning">
          {commify(data.order_quantity!)}
        </span>
        .
      </div>
    );
  } else {
    if (dirtyFields["order_price"]) {
      confirmText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          You agree changing the price of {base}-PERP order to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_price!)}
          </span>
          .
        </div>
      );
    }

    if (dirtyFields["order_quantity"]) {
      confirmText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          You agree changing the quantity of {base}-PERP order to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_quantity!)}
          </span>
          .
        </div>
      );
    }
  }

  return confirmText;
};

const AlgoContent: FC<{
  data: OrderEntity,
  dirtyFields: Partial<OrderEntity>,
  base: string,
  symbol: string,
  isMarketOrder: boolean,
  isAlgoOrder: boolean,
}> = (props) => {

  const { data, dirtyFields, base, symbol, isMarketOrder, isAlgoOrder } = props;
  const quote = symbol?.split("_")[2];

  const qty = data.order_quantity || "-";
  const triggerPrice = data.trigger_price || "-";
  const price = data.order_price || "-";

  console.log("algo content", symbol, data);
  

  return (<div>
    <div className="orderly-text-sm orderly-text-base-contrast-80">
      {`You agree to edit your ${base}-PERP order.`}
    </div>
    <div className="orderly-flex orderly-items-center orderly-pt-6 orderly-pb-3">
      <NetworkImage symbol={symbol} type="symbol" size={20} />
      <span className="orderly-text-lg orderly-pl-2">
        {`${base}-PERP`}
      </span>
    </div>
    <div className="orderly-flex orderly-justify-between orderly-text-sm orderly-pb-1">
      <span className="orderly-text-base-contrast-54">Qty</span>
      <div className="orderly-inline-block">
        <Numeral className={cn(
          "orderly-mr-1",
          data.side === "BUY" ? "orderly-text-trade-profit" : "orderly-text-trade-loss",
        )}>{qty}</Numeral>
        <span className="orderly-text-base-contrast-36">{base}</span>
      </div>
    </div>
    {isAlgoOrder && <div className="orderly-flex orderly-justify-between orderly-text-sm orderly-pb-1">
      <span className="orderly-text-base-contrast-54">Trigger price</span>
      <div className="orderly-inline-block">
        <span className="orderly-mr-1">{commify(triggerPrice)}</span>
        <span className="orderly-text-base-contrast-36">{quote}</span>
      </div>
    </div>}
    <div className="orderly-flex orderly-justify-between orderly-text-sm">
      <span className="orderly-text-base-contrast-54">Price</span>
      <div className="orderly-inline-block">
        {isMarketOrder ? <span>Market</span> :  <span>{commify(price)}</span>}
        <span className="orderly-ml-1 orderly-text-base-contrast-36">{quote}</span>
      </div>
    </div>
  </div>);
}
