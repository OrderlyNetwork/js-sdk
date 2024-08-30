import { Tag } from "@/tag/tag";
import {
  API,
  AlgoOrderRootType,
  AlgoOrderType,
  OrderType,
} from "@orderly.network/types";
import { FC, useMemo } from "react";

export const OrderTypeTag: FC<{
  order: API.OrderExt | API.AlgoOrderExt;
}> = (props) => {
  const positionType = useMemo(() => {
    if (!("parent_algo_type" in props.order)) {
      return null;
    }
    if (props.order.parent_algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return (
        <Tag className="orderly-bg-primary/20 orderly-text-3xs">Position</Tag>
      );
    }
  }, [props.order]);

  const orderType = useMemo(() => {
    // if (!("algo_type" in props.order)) {
    //   return null;
    // }

    let type;

    if ("algo_type" in props.order) {
      if (props.order.algo_type === AlgoOrderType.TAKE_PROFIT) {
        // need check if it is STOP LIMIT or STOP MARKET
        if (props.order.type === OrderType.MARKET) {
          type = "Stop market";
        } else if (props.order.type === OrderType.LIMIT) {
          type = "Stop limit";
        } else {
          type = "TP";
        }
      }

      if (props.order.algo_type === AlgoOrderType.STOP_LOSS) {
        type = "SL";
      }
    } else {
      if (props.order.type === OrderType.MARKET) {
        type = "Market";
      } else if (props.order.type === OrderType.LIMIT) {
        type = "Limit";
      }
    }

    if (!type) {
      return null;
    }

    return (
      <Tag className="orderly-bg-white/10 orderly-text-base-contrast-54 orderly-text-3xs">
        {type}
      </Tag>
    );
  }, [props.order]);

  return (
    <div className="orderly-flex orderly-mt-1 orderly-space-x-1">
      {positionType}
      {orderType}
    </div>
  );
};
