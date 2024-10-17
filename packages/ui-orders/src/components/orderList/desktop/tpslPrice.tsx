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
