import { Tag } from "@/tag/tag";
import { utils } from "@orderly.network/hooks";
import { API, AlgoOrderRootType } from "@orderly.network/types";
import { FC, useMemo } from "react";

export const TPSLOrderTag: FC<{
  order: API.AlgoOrderExt | API.OrderExt;
}> = (props) => {
  const { order } = props;

  const tpslInfo = useMemo(() => {
    if (!("algo_type" in order) || !Array.isArray(order.child_orders)) {
      return null;
    }
    const tp_sl = utils.findTPSLFromOrder(order);
    const keys = [];
    if (tp_sl.tp_trigger_price) {
      keys.push("TP");
    }

    if (tp_sl.sl_trigger_price) {
      keys.push("SL");
    }

    if (keys.length === 0) {
      return null;
    }

    if (keys.length === 2) {
      keys.splice(1, 0, "/");
    }

    return (
      <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-mt-1">
        {order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL ? (
          <Tag className="orderly-bg-primary/20 orderly-text-3xs">Position</Tag>
        ) : null}
        <Tag className="orderly-bg-white/10 orderly-text-base-contrast-54 orderly-text-3xs">
          {keys.map((key) => (
            <span key={key}>{key}</span>
          ))}
        </Tag>
      </div>
    );
  }, [order]);

  return tpslInfo;
};
