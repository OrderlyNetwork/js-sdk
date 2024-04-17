import { FC, useMemo } from "react";
import { API, AlgoOrderRootType, AlgoOrderType } from "@orderly.network/types";

export const AlgoOrderBadge: FC<{
  order: API.AlgoOrder;
}> = (props) => {
  const positionBadge = useMemo(() => {
    if (props.order.algo_type !== AlgoOrderRootType.POSITIONAL_TP_SL) {
      return null;
    }

    return (
      <span
        className={
          "orderly-text-primary orderly-inline-block orderly-bg-primary/10 orderly-px-1 orderly-rounded"
        }
      >
        Position
      </span>
    );
  }, [props.order.algo_type]);

  const tpslBadge = useMemo(() => {
    const tpOrder = props.order.child_orders.find(
      (order) =>
        order.algo_type === AlgoOrderType.TAKE_PROFIT && !!order.trigger_price
    );

    const slOrder = props.order.child_orders.find(
      (order) =>
        order.algo_type === AlgoOrderType.STOP_LOSS && !!order.trigger_price
    );

    if (!tpOrder && !slOrder) {
      return null;
    }

    return (
      <span
        className={
          "orderly-text-base-contrast-36 orderly-inline-block orderly-bg-white/10 orderly-px-1 orderly-rounded"
        }
      >
        {tpOrder && slOrder ? "TP/SL" : tpOrder ? "TP" : "SL"}
      </span>
    );
  }, [props.order.child_orders]);

  return (
    <div className={"orderly-flex orderly-gap-1 orderly-text-3xs orderly-td-bg-transparent"}>
      {positionBadge} {tpslBadge}
    </div>
  );
};
