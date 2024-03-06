import { useEffect, useRef } from "react";
import { useWS } from "../useWS";
import { mutate } from "swr";
import { WSMessage, API } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { unstable_serialize } from "swr/infinite";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../useEventEmitter";
import { getKeyFunction } from "../dataProvider";
import { parseJSON } from "../utils/json";
import { updateOrdersHandler } from "../utils/swr";

export const usePrivateDataObserver = (options: {
  // onUpdateOrders: (data: any) => void;
  getKeysMap: (type: string) => Map<string, getKeyFunction>;
}) => {
  const ws = useWS();
  // const { mutate } = useSWRConfig();
  const ee = useEventEmitter();
  const { state } = useAccount();

  // TODO: remove this when the WS service provides the correct data
  const algoOrderCacheQuneue = useRef<API.AlgoOrder[]>([]);

  const updateOrders = (
    data: WSMessage.AlgoOrder | WSMessage.Order,
    isAlgoOrder: boolean
  ) => {
    const map = options.getKeysMap("orders");

    console.log("$$$$$$$$$$$$", data);

    if (isAlgoOrder) {
      /// TODO: remove this when the WS service provides the correct data
      if (algoOrderCacheQuneue.current.length) {
        const index = algoOrderCacheQuneue.current.findIndex(
          (item: any) =>
            item.order_id === (data as WSMessage.AlgoOrder).algoOrderId
        );

        if (index > -1) {
          data = {
            ...data,
            ...algoOrderCacheQuneue.current[index],
          };
          algoOrderCacheQuneue.current.splice(index, 1);
        }
      }
    }

    map.forEach((getKey, key) => {
      mutate(
        unstable_serialize((index, prevData) => [
          getKey(index, prevData),
          state.accountId,
        ]),
        (prevData?: any[]) => {
          return updateOrdersHandler(key, data, prevData);
        },
        {
          revalidate: false,
        }
      );
    });

    //  emit events;
    // ee.emit("orders:changed", {
    //   ...data,
    //   status: data.status || (data as WSMessage.AlgoOrder).algoStatus,
    // });

    ee.emit("orders:changed", {
      ...data,
      status: data.status || (data as WSMessage.AlgoOrder).algoStatus,
    });
  };

  // orders
  useEffect(() => {
    if (!state.accountId) return;
    const unsubscribe = ws.privateSubscribe("executionreport", {
      onMessage: (data: any) => {
        updateOrders(data, false);
      },
    });

    return () => unsubscribe?.();
  }, [state.accountId]);

  // algo orders
  useEffect(() => {
    if (!state.accountId) return;
    const unsubscribe = ws.privateSubscribe("algoexecutionreport", {
      onMessage: (data: any) => {
        if (Array.isArray(data)) {
          data.forEach((item) => {
            updateOrders(item, true);

            // ee.emit("orders:changed", { ...item, status: item.algoStatus });
          });
        } else {
          updateOrders(data, true);
          // ee.emit("orders:changed", { ...data, status: data.algoStatus });
        }
      },
    });

    return () => unsubscribe?.();
  }, [state.accountId]);

  // positions
  useEffect(() => {
    if (!state.accountId) return;
    const key = ["/v1/positions", state.accountId];
    const unsubscribe = ws.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPostions } = data;

        // console.log("ws----- positions data-----", data);

        // updatePositions();

        mutate(
          key,
          (prevPositions: any) => {
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
          },
          {
            revalidate: false,
          }
        );
      },
    });
    return () => {
      unsubscribe?.();
    };
  }, [state.accountId]);

  // cache algo orders
  useEffect(() => {
    const handler = (data: API.AlgoOrder) => {
      algoOrderCacheQuneue.current.push(data);
    };

    ee.on("algoOrder:cache", handler);

    return () => {
      ee.off("algoOrder:cache", handler);
    };
  }, []);
};
