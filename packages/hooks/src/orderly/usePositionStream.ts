import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWebSocketClient } from "../useWebSocketClient";
import { positions } from "@orderly/futures";
import { useObservable } from "rxjs-hooks";
import { map } from "rxjs/operators";
import { type API } from "@orderly/core";

export interface PositionReturn {
  data: any[];
  loading: boolean;
  close: (qty: number) => void;
}

export const usePositionStream = (symbol?: string) => {
  // const [data, setData] = useState<Position[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [visibledSymbol, setVisibleSymbol] = useState<string | undefined>(
    symbol
  );

  const { data, error } = usePrivateQuery<API.Position[]>(`/positions`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const ws = useWebSocketClient();

  // console.log("positions", positions);

  const aggregatedData = useMemo(() => {
    const aggregatedData = {
      unrealizedPnl: NaN,
      unrealPnl: NaN,
      notional: NaN,
    };

    return aggregatedData;
  }, [data]);

  type PositionArray = API.Position[] | undefined;

  const value = useObservable<PositionArray, PositionArray[]>(
    (_, input$) =>
      input$.pipe(
        map((data) => {
          return data[0];
        }),
        map((data) => {
          console.log("obser", data);
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
    [data]
  );

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
   */

  return [
    value,
    aggregatedData,
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
