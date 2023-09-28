import { useEffect } from "react";

import { useWS } from "../useWS";
import { useSWRConfig } from "swr";
import { API, OrderStatus, WSMessage } from "@orderly.network/types";
import { useEventEmitter } from "../useEventEmitter";
import { useAccount } from "../useAccount";

export const usePrivateDataObserver = () => {
  const ws = useWS();
  const { mutate } = useSWRConfig();
  const ee = useEventEmitter();
  const { state } = useAccount();

  useEffect(() => {
    const unsubscribe = ws.privateSubscribe("executionreport", {
      onMessage: (data: any) => {
        const key = ["/v1/orders?status=NEW", state.accountId];
        // console.log("------ orders push -----------", data);
        // console.log(cache);

        mutate(key, (orders: any) => {
          // console.log(orders);
          return Promise.resolve()
            .then(() => {
              if (!orders) {
                return orders;
              }
              if (data.status === OrderStatus.NEW) {
                return [
                  {
                    ...data,
                    // average_executed_price:data.ava
                    created_time: data.timestamp,
                    order_id: data.orderId,
                    // reduce_only
                  },
                  ...orders,
                ];
              }
              if (data.status === OrderStatus.CANCELLED) {
                return orders.filter(
                  (order: any) => order.order_id !== data.orderId
                );
              }

              return orders;
            })
            .catch((error) => {
              console.log("error", error, error.stack);
            });
        });

        ee.emit("orders:changed");
      },
    });
    return () => unsubscribe?.();
  }, [state.accountId]);

  useEffect(() => {
    console.log("subscribe: position: %s", state.accountId);
    if (!state.accountId) return;
    const key = ["/v1/positions", state.accountId];
    const unsubscribe = ws.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPostions } = data;

        mutate(key, (prevPositions: any) => {
          // return nextPostions;
          if (!!prevPositions) {
            return {
              ...prevPositions,
              rows: prevPositions.rows.map((row: any) => {
                const item = nextPostions.find(
                  (item) => item.symbol === row.symbol
                );
                if (item) {
                  return {
                    symbol: item.symbol,
                    position_qty: item.positionQty,
                    cost_position: item.costPosition,
                    last_sum_unitary_funding: item.lastSumUnitaryFunding,
                    pending_long_qty: item.pendingLongQty,
                    pending_short_qty: item.pendingShortQty,
                    settle_price: item.settlePrice,
                    average_open_price: item.averageOpenPrice,
                    unsettled_pnl: item.unsettledPnl,
                    mark_price: item.markPrice,
                    est_liq_price: item.estLiqPrice,
                    timestamp: Date.now(),
                    imr: item.imr,
                    mmr: item.mmr,
                    IMR_withdraw_orders: item.imrwithOrders,
                    MMR_with_orders: item.mmrwithOrders,
                    pnl_24_h: item.pnl24H,
                    fee_24_h: item.fee24H,
                  };
                }

                return row;
              }),
            };
          }
        });
      },
    });
    return () => {
      console.log("unsubscribe: private subscription position");
      unsubscribe?.();
    };
  }, [state.accountId]);
};
