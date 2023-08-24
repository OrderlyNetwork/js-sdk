import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWebSocketClient } from "../useWebSocketClient";
import { positions } from "@orderly/futures";
import { useObservable } from "rxjs-hooks";
import { map } from "rxjs/operators";
import { type API } from "@orderly/core";
import { type SWRConfiguration } from "swr";
import { createGetter } from "../utils/createGetter";

export interface PositionReturn {
  data: any[];
  loading: boolean;
  close: (qty: number) => void;
}

export const usePositionStream = (
  symbol?: string,
  options?: SWRConfiguration
) => {
  // const [data, setData] = useState<Position[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [visibledSymbol, setVisibleSymbol] = useState<string | undefined>(
    symbol
  );

  const { data, error, isLoading } = usePrivateQuery<API.PositionInfo>(
    `/positions`,
    {
      // revalidateOnFocus: false,
      // revalidateOnReconnect: false,
      ...options,
      formatter: (data) => data,
    }
  );

  const ws = useWebSocketClient();

  // console.log("positions", positions);

  type PositionArray = API.Position[] | undefined;

  const value = useObservable<PositionArray, PositionArray[]>(
    (_, input$) =>
      input$.pipe(
        map((data) => {
          return data[0];
        }),
        map((data) => {
          // console.log("obser", data);
          return data?.map((item) => {
            return {
              ...item,
              notional: positions.notional(
                item.position_qty,
                item.average_open_price
              ),
            };
          });
        })
      ),
    undefined,
    [data?.rows]
  );

  // 合计数据
  const aggregatedData = useMemo(() => {
    const aggregatedData = {
      unsettledPnl: NaN,
      unrealPnl: NaN,
      notional: NaN,
    };

    if (value && value.length) {
    }

    return aggregatedData;
  }, [value]);

  const showSymbol = useCallback((symbol: string) => {
    setVisibleSymbol(symbol);
  }, []);

  /**
   * 返回数据格式
   * {
   *     data:Position[],
   *     overView:{
   *      unrealizedPnl: number;
   *      unrealPnl: number;
   *      notional: number;
   *     }
   * }
   *
   */

  // type getType = ReturnType<
  //   typeof createGetter<Omit<API.PositionInfo, "rows">>
  // >;

  return [
    { rows: value, aggregated: aggregatedData },
    createGetter<Omit<API.PositionInfo, "rows">>(data as any, 1),
    {
      close: (qty: number) => {},
      loading: false,
      showSymbol,
      error,
      loadMore: () => {},
      refresh: () => {},
      // toggleHideOthers,
      // filter: (filter: string) => {},
    },
  ];
};
