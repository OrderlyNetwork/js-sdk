import { useEffect } from "react";
import { useWS } from "../useWS";
import { mutate } from "swr";
import { API, WSMessage } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { unstable_serialize } from "swr/infinite";
import { useEventEmitter } from "../useEventEmitter";
import { getKeyFunction } from "../dataProvider";
import { updateOrdersHandler, updateAlgoOrdersHandler } from "../utils/swr";
import { AlgoOrderMergeHandler } from "../services/orderMerge/algoOrderMergeHandler";
import { object2underscore } from "../utils/ws";
import { useLocalStorage } from "../useLocalStorage";
import { usePrivateQuery } from "../usePrivateQuery";
import { useAppStore } from "./appStore";
import { useCalculatorService } from "../useCalculatorService";
import { CalculatorScope } from "../types";
import { useApiStatusActions } from "../next/apiStatus/apiStatus.store";
import { AccountStatusEnum } from "@orderly.network/types";
import { usePositionActions } from "./orderlyHooks";
import { AccountState, EVENT_NAMES } from "@orderly.network/core";

export const usePrivateDataObserver = (options: {
  // onUpdateOrders: (data: any) => void;
  getKeysMap: (type: string) => Map<string, getKeyFunction>;
}) => {
  const ws = useWS();
  // const { mutate } = useSWRConfig();
  const ee = useEventEmitter();
  const { state, account } = useAccount();
  const { setAccountInfo, restoreHolding, updateHolding, cleanAll } =
    useAppStore((state) => state.actions);
  const statusActions = useApiStatusActions();
  const calculatorService = useCalculatorService();
  const positionsActions = usePositionActions();
  // fetch the data of current account

  const { data: clientInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  useEffect(() => {
    if (clientInfo) {
      setAccountInfo(clientInfo);
    }
  }, [clientInfo, setAccountInfo]);
  //======================

  /**
   * fetch the positions of current account
   */
  const { data: positions, isLoading: isPositionLoading } =
    usePrivateQuery<API.PositionInfo>("/v1/positions", {
      formatter: (data) => data,
      onError: (error) => {
        statusActions.updateApiError("positions", error.message);
      },
    });

  // check status, if state less than AccountStatusEnum.EnableTrading, will be clean positions
  useEffect(() => {
    const handler = (state: AccountState) => {
      if (!state.accountId) {
        calculatorService.stop();
        cleanAll();
        positionsActions.clearAll();
      }
    };

    account.on(EVENT_NAMES.statusChanged, handler);

    return () => {
      account.off(EVENT_NAMES.statusChanged, handler);
    };
  }, []);

  useEffect(() => {
    /// start load positions
    if (isPositionLoading) {
      statusActions.updateApiLoading("positions", isPositionLoading);
    }
  }, [isPositionLoading, statusActions]);

  useEffect(() => {
    if (positions && Array.isArray(positions.rows)) {
      // if (positions.rows.length > 0) {
      calculatorService.calc(CalculatorScope.POSITION, positions);
      // } else {
      //   statusActions.updateApiLoading("positions", false);
      // }
    }
  }, [calculatorService, positions]);

  //======================

  // useHolding
  const { data: holding } = usePrivateQuery<API.Holding[]>(
    "/v1/client/holding",
    {
      formatter: (data) => data.holding,
    }
  );

  useEffect(() => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "balance",
        event: "subscribe",
        topic: "balance",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          const holding = data?.balances ?? ({} as Record<string, any>);

          if (holding) {
            console.log("---->>>>>>!!!! holding", holding);

            updateHolding(holding);
          }
        },
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (holding) {
      restoreHolding(holding);
    }
  }, [holding]);

  const [subOrder, setSubOrder] = useLocalStorage(
    "orderly_subscribe_order",
    true
  );

  const updateOrders = (
    data: WSMessage.AlgoOrder[] | WSMessage.Order,
    isAlgoOrder: boolean
  ) => {
    const keysMap = options.getKeysMap("orders");

    keysMap.forEach((getKey, key) => {
      mutate(
        unstable_serialize((index, prevData) => [
          getKey(index, prevData),
          state.accountId,
        ]),
        (prevData?: any[]) => {
          try {
            if (isAlgoOrder) {
              const result = updateAlgoOrdersHandler(
                key,
                data as WSMessage.AlgoOrder[],
                prevData!
              );

              return result;
            }
            return updateOrdersHandler(key, data as WSMessage.Order, prevData);
          } catch (error) {
            return prevData;
          }
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

    const formattedData = isAlgoOrder
      ? AlgoOrderMergeHandler.groupOrders(data as WSMessage.AlgoOrder[])
      : object2underscore(data);

    ee.emit("orders:changed", {
      ...formattedData,
      status: isAlgoOrder
        ? formattedData.algo_status
        : (data as WSMessage.Order).status,
    });
  };

  // orders
  useEffect(() => {
    if (!state.accountId) return;
    if (subOrder !== true) return;
    const unsubscribe = ws.privateSubscribe("executionreport", {
      onMessage: (data: any) => {
        updateOrders(data, false);
      },
    });

    return () => unsubscribe?.();
  }, [state.accountId, subOrder]);

  // algo orders
  useEffect(() => {
    if (!state.accountId) return;
    if (subOrder !== true) return;
    const unsubscribe = ws.privateSubscribe("algoexecutionreport", {
      onMessage: (data: any) => {
        updateOrders(data, true);
      },
    });

    return () => unsubscribe?.();
  }, [state.accountId, subOrder]);

  // positions
  useEffect(() => {
    if (!state.accountId) return;
    const key = ["/v1/positions", state.accountId];
    const unsubscribe = ws.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPostions } = data;

        // updatePositions();

        mutate(
          key,
          (prevPositions: any) => {
            // return nextPostions;
            if (!!prevPositions) {
              const newPostions = {
                ...prevPositions,
                rows: prevPositions.rows.map((row: any) => {
                  const itemIndex = nextPostions.findIndex(
                    (item) => item.symbol === row.symbol
                  );

                  // const item = nextPostions.find(
                  //   (item) => item.symbol === row.symbol
                  // );

                  if (itemIndex >= 0) {
                    const itemArr = nextPostions.splice(itemIndex, 1);

                    const item = itemArr[0];

                    return object2underscore(item);
                  }

                  return row;
                }),
              };

              if (nextPostions.length > 0) {
                newPostions.rows = [
                  ...newPostions.rows,
                  ...nextPostions.map((item) => {
                    return object2underscore(item);
                  }),
                ];
              }

              return newPostions;
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
