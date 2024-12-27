import { utils } from "@orderly.network/hooks";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";


export const TPSLOrderPrice = () => {
  const { sl_trigger_price, tp_trigger_price } = useTPSLOrderRowContext();
  return (
    <div>
      {!!tp_trigger_price ? (
        <div className={"oui-text-base-contrast-80 oui-td-bg-transparent"}>
          <span className={"oui-text-base-contrast-54"}>
            TP&nbsp;-&nbsp;
          </span>
          <span>Market</span>
        </div>
      ) : null}
      {!!sl_trigger_price ? (
        <div className={"oui-text-base-contrast-80 oui-td-bg-transparent"}>
          <span className={"oui-text-base-contrast-54"}>
            SL&nbsp;-&nbsp;
          </span>
          <span>Market</span>
        </div>
      ) : null}
    </div>
  );
};

export function useTPSLOrderPrice (order: any)  {
  // @ts-ignore
  const { sl_trigger_price, tp_trigger_price } =
  !("algo_type" in order) || !Array.isArray(order.child_orders)
    ? {}
    : utils.findTPSLFromOrder(order);
  
  const tpTriggerPrice = tp_trigger_price ? "TP - Market" : undefined;
  const slTriggerPrice = sl_trigger_price ? "SL - Market" : undefined;

  return { tpTriggerPrice, slTriggerPrice };
};
