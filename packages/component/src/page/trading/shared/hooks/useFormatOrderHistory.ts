import {
  API,
  AccountStatusEnum,
  AlgoOrderRootType,
  OrderStatus,
} from "@orderly.network/types";
import { useMemo } from "react";

export const useFormatOrderHistory = (data: API.AlgoOrderExt[]) => {
  const formattedData = useMemo(() => {
    // if (state.status < AccountStatusEnum.EnableTrading || !data) {
    //     return [];
    // }
    const _data = [];

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      // console.log("element", element);
      if (
        element.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL ||
        element.algo_type === AlgoOrderRootType.TP_SL
      ) {
        if (
          element.algo_status !== OrderStatus.FILLED &&
          element.algo_status !== OrderStatus.PARTIAL_FILLED
        ) {
          for (let j = 0; j < element.child_orders.length; j++) {
            const e = element.child_orders[j];
            if (!e.is_activated || !e.trigger_price) {
              continue;
            }
            (e as any).parent_algo_type = element.algo_type;
            _data.push(e);
          }
        } else {
          // if order is filled then show only the filled order
          for (let j = 0; j < element.child_orders.length; j++) {
            const e = element.child_orders[j];
            if (
              !!e &&
              (e.algo_status === OrderStatus.FILLED ||
                e.algo_status === OrderStatus.PARTIAL_FILLED)
            ) {
              (e as any).parent_algo_type = element.algo_type;
              _data.push(e);
            }
          }
        }
      } else {
        _data.push(element);
      }
    }

    return _data;

    // data.map((item) => {});
  }, [data]);

  return formattedData;
};
