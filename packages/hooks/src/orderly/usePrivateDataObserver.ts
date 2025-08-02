import { useEffect, useRef } from "react";
import { mutate } from "swr";
import { unstable_serialize } from "swr/infinite";
import { AccountState, EVENT_NAMES } from "@orderly.network/core";
import { API, WSMessage } from "@orderly.network/types";
import { AccountStatusEnum } from "@orderly.network/types";
import { useApiStatusActions } from "../next/apiStatus/apiStatus.store";
import { getKeyFunction } from "../provider/dataCenter/dataCenterContext";
import { AlgoOrderMergeHandler } from "../services/orderMerge/algoOrderMergeHandler";
import { CalculatorScope } from "../types";
import { useAccount } from "../useAccount";
import { useCalculatorService } from "../useCalculatorService";
import { useEventEmitter } from "../useEventEmitter";
import { useLocalStorage } from "../useLocalStorage";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWS } from "../useWS";
import { updateOrdersHandler, updateAlgoOrdersHandler } from "../utils/swr";
import { object2underscore } from "../utils/ws";
import { useAppStore } from "./appStore";
import { usePositionActions } from "./orderlyHooks";

export const usePrivateDataObserver = (options: {
  getKeysMap: (type: string) => Map<string, getKeyFunction>;
}) => {
  const ws = useWS();
  // const { mutate } = useSWRConfig();
  const ee = useEventEmitter();
  const { state, account } = useAccount();
  const { setAccountInfo, restoreHolding, cleanAll } = useAppStore(
    (state) => state.actions,
  );
  const statusActions = useApiStatusActions();
  const calculatorService = useCalculatorService();
  const positionsActions = usePositionActions();
  // fetch the data of current account

  const { data: clientInfo } = usePrivateQuery<API.AccountInfo>(
    "/v1/client/info",
    {
      revalidateOnFocus: false,
    },
  );

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
      // revalidateOnFocus: false,
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
      // revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!account.accountId) return;

    // TODO: useBalanceTopic
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

            // updateHolding(holding);
            // ws message format
            // {
            //   USDC: {
            //     holding: 5555815.47398272,
            //     frozen: 0,
            //   },
            // };
            calculatorService.calc(CalculatorScope.PORTFOLIO, { holding });
          }
        },
      },
    );

    return () => unsubscribe?.();
    // TODO: use state.accountId
  }, [account.accountId]);

  const isHoldingInit = useRef(false);

  useEffect(() => {
    isHoldingInit.current = false;
    // if switch address, we should reset the holding
  }, [state.address]);

  useEffect(() => {
    if (!holding) {
      return;
    }
    // [
    //   {
    //     updated_time: 1747701141241,
    //     token: "USDC",
    //     holding: 12000.963747,
    //     frozen: 37855.270927,
    //     pending_short: 0.0,
    //   },
    // ];
    if (isHoldingInit.current) {
      calculatorService.calc(CalculatorScope.PORTFOLIO, { holding });
    } else {
      restoreHolding(holding);
    }
    isHoldingInit.current = true;
  }, [holding]);

  const [subOrder] = useLocalStorage("orderly_subscribe_order", true);

  const updateOrders = (
    data: WSMessage.AlgoOrder[] | WSMessage.Order,
    isAlgoOrder: boolean,
  ) => {
    const keysMap = options.getKeysMap("orders");

    const filteredKeys = new Map();
    const keyStartWith = isAlgoOrder ? "algoOrders" : "orders";

    const keys = keysMap.keys();

    for (const key of keys) {
      if (key.startsWith(keyStartWith)) {
        filteredKeys.set(key, keysMap.get(key));
      }
    }

    filteredKeys.forEach((getKey, key) => {
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
                prevData!,
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
        },
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
    if (!state.accountId) {
      return;
    }
    if (subOrder !== true) {
      return;
    }
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
    if (!state.accountId) {
      return;
    }
    const key = ["/v1/positions", state.accountId];
    const unsubscribe = ws.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPositions } = data;

        // updatePositions();

        mutate(
          key,
          (prevPositions: any) => {
            // return nextPositions;
            if (!!prevPositions) {
              const newPositions = {
                ...prevPositions,
                rows: prevPositions.rows.map((row: any) => {
                  const itemIndex = nextPositions.findIndex(
                    (item) => item.symbol === row.symbol,
                  );

                  // const item = nextPositions.find(
                  //   (item) => item.symbol === row.symbol
                  // );

                  if (itemIndex >= 0) {
                    const itemArr = nextPositions.splice(itemIndex, 1);

                    const item = itemArr[0];

                    // ignore the ws update with averageOpenPrice === 0
                    if (item.averageOpenPrice === 0 && item.positionQty !== 0) {
                      return row;
                    }
                    // console.log("---->>>>>>!!!! item", item);

                    return object2underscore(item);
                  }

                  return row;
                }),
              };

              if (nextPositions.length > 0) {
                newPositions.rows = [
                  ...newPositions.rows,
                  ...nextPositions.map(object2underscore),
                ];
              }

              return newPositions;
            }
          },
          {
            revalidate: false,
          },
        );
      },
    });
    return () => {
      unsubscribe?.();
    };
  }, [state.accountId]);
};
