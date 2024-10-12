import { FC } from "react";
import { Statistic } from "@/statistic/statistic";
import { NumeralTotal } from "@/text/numeralTotal";
import { API, OrderSide } from "@orderly.network/types";

export const RegularCell: FC<{
  order: API.OrderExt;
  base_dp: number;
  quote_dp: number;
}> = (props) => {
  const { order, base_dp, quote_dp } = props;
  const isAlgoOrder = order?.algo_order_id !== undefined;
  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  return (
    <>
      <Statistic
        label="Qty."
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        value={order.quantity ?? "-"}
        precision={base_dp}
        rule="price"
        valueClassName={
          order.side === OrderSide.BUY
            ? "orderly-text-trade-profit orderly-text-2xs"
            : "orderly-text-trade-loss orderly-text-2xs"
        }
      />
      <Statistic
        label="Filled"
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
        // @ts-ignore
        value={order.total_executed_quantity ?? "-"}
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
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
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
            <span className="orderly-text-base-contrast-36">Trigger price</span>
            {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
          </>
        }
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
        rule="price"
        precision={quote_dp}
        value={order.trigger_price}
      />
      <Statistic
        label={
          <>
            <span className="orderly-text-base-contrast-36">Limit price</span>
            {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
          </>
        }
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
        value={isStopMarket ? <span>Market</span> : order.price ?? "-"}
        rule="price"
        precision={quote_dp}
      />
      <Statistic
        label={
          <>
            <span className="orderly-text-base-contrast-36">Mark price</span>
            {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
          </>
        }
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
        rule="price"
        precision={quote_dp}
        value={order.mark_price}
        align="right"
      />
    </>
  );
};
