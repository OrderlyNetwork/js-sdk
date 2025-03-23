import { utils } from "@orderly.network/hooks";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";

export const TPSLOrderPrice = () => {
  const { sl_trigger_price, tp_trigger_price } = useTPSLOrderRowContext();
  const { t } = useTranslation();

  return (
    <div>
      {!!tp_trigger_price ? (
        <div className={"oui-text-base-contrast-80 oui-td-bg-transparent"}>
          <Text intensity={54}>{`${t("tpsl.tp")} -`}&nbsp;</Text>
          <span>{t("orders.price.market")}</span>
        </div>
      ) : null}
      {!!sl_trigger_price ? (
        <div className={"oui-text-base-contrast-80 oui-td-bg-transparent"}>
          <span className={"oui-text-base-contrast-54"}>
            {`${t("tpsl.sl")} -`}&nbsp;
          </span>
          <span>{t("orders.price.market")}</span>
        </div>
      ) : null}
    </div>
  );
};

export function useTPSLOrderPrice(order: any) {
  // @ts-ignore
  const { sl_trigger_price, tp_trigger_price } =
    !("algo_type" in order) || !Array.isArray(order.child_orders)
      ? {}
      : utils.findTPSLFromOrder(order);

  const tpTriggerPrice = tp_trigger_price
    ? `${i18n.t("tpsl.tp")} - ${i18n.t("tpsl.market")}`
    : undefined;
  const slTriggerPrice = sl_trigger_price
    ? `${i18n.t("tpsl.sl")} - ${i18n.t("tpsl.market")}`
    : undefined;

  return { tpTriggerPrice, slTriggerPrice };
}
