import { FC, useMemo } from "react";
import { API, AlgoOrderRootType, AlgoOrderType } from "@orderly.network/types";
import { Tag } from "@/tag";

export const AlgoOrderBadge: FC<{
  order: API.AlgoOrder;
}> = (props) => {
  const positionBadge = useMemo(() => {
    if (props.order.algo_type !== AlgoOrderRootType.POSITIONAL_TP_SL) {
      return null;
    }

    return (
      <Tag
        className={
          "orderly-text-primary orderly-bg-primary/10"
        }
      >
        Position
      </Tag>
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
      <Tag
        className={
          "orderly-text-base-contrast-36 orderly-bg-white/10"
        }
      >
        {tpOrder && slOrder ? "TP/SL" : tpOrder ? "TP" : "SL"}
      </Tag>
    );
  }, [props.order.child_orders]);

  return (
    <div className={"orderly-flex orderly-gap-1 orderly-text-3xs orderly-td-bg-transparent orderly-h-[18px]"}>
      {positionBadge} {tpslBadge}
    </div>
  );
};
