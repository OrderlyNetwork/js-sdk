import { useEffect } from "react";
import { useWS } from "../useWS";
import { useSWRConfig } from "swr";
import { WSMessage } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { unstable_serialize } from "swr/infinite";
import { useDebouncedCallback } from "use-debounce";
import { useEventEmitter } from "../useEventEmitter";
import { getKeyFunction } from "../dataProvider";
import { parseJSON } from "../utils/json";

export const usePrivateDataObserver = (options: {
  // onUpdateOrders: (data: any) => void;
  getKeysMap: (type: string) => Map<string, getKeyFunction>;
}) => {
  const ws = useWS();
  const { mutate } = useSWRConfig();
  const ee = useEventEmitter();
  const { state } = useAccount();

  const updateOrders = useDebouncedCallback((data) => {
    const map = options.getKeysMap("orders");
    const orderStatus = getSessionStorage(
      "orderly_order_status",
      "positions"
    ) as string;

    map.forEach((getKey, key) => {
      if (
        (orderStatus === "history" && key === "orders") ||
        (orderStatus === "positions" && key === "orders:NEW") ||
        key.includes(orderStatus)
      ) {
        mutate(
          unstable_serialize((index, prevData) => [
            getKey(index, prevData),
            state.accountId,
          ])
        );
      }
    });

    // update the orders history list;

    // ee.emit("orders:changed");
  }, 500);

  // orders
  useEffect(() => {
    if (!state.accountId) return;
    const unsubscribe = ws.privateSubscribe("executionreport", {
      onMessage: (data: any) => {
        updateOrders(data);
        ee.emit("orders:changed", data);
      },
    });

    return () => unsubscribe?.();
  }, [state.accountId]);

  // algo orders
  useEffect(() => {
    if (!state.accountId) return;
    const unsubscribe = ws.privateSubscribe("algoexecutionreport", {
      onMessage: (data: any) => {
        updateOrders(data);
        if (Array.isArray(data)) {
          data.forEach((item) =>
            ee.emit("orders:changed", { ...item, status: item.algoStatus })
          );
        } else {
          ee.emit("orders:changed", { ...data, status: data.algoStatus });
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
};

const getSessionStorage = (key: string, initialValue: string) => {
  // Prevent build error "window is undefined" but keep keep working
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.sessionStorage.getItem(key);
    return item ? parseJSON(item) : initialValue;
  } catch (error) {
    console.warn(`Error reading sessionStorage key “${key}”:`, error);
    return initialValue;
  }
};
