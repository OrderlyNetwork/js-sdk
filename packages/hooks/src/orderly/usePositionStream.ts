import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { positions } from "@orderly.network/futures";
import { useObservable } from "rxjs-hooks";
import { combineLatestWith, debounce, debounceTime, map } from "rxjs/operators";

import { type SWRConfiguration } from "swr";
import { createGetter } from "../utils/createGetter";
import { useFundingRates } from "./useFundingRates";
import { type API } from "@orderly.network/types";
import { useMarkPricesSubject } from "./useMarkPricesSubject";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { useAccount } from "../useAccount";
import { useCollateral } from "./useCollateral";

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

  const symbolInfo = useSymbolsInfo();
  const { info: accountInfo } = useAccount();

  const fundingRates = useFundingRates();
  const markPrices$ = useMarkPricesSubject();
  // const { totalCollateral } = useCollateral();

  const { data, error, isLoading } = usePrivateQuery<API.PositionInfo>(
    `/positions`,
    {
      // revalidateOnFocus: false,
      // revalidateOnReconnect: false,
      ...options,
      formatter: (data) => data,
    }
  );

  type PositionArray =
    | (API.Position & {
        sum_unitary_funding?: number;
      })[]
    | undefined;

  // TODO: 动态更新 markprice
  const value = useObservable<PositionArray, [PositionArray, any, any]>(
    (_, input$) =>
      input$.pipe(
        // map((data) => {
        //   return data[0];
        // }),
        combineLatestWith(markPrices$),
        debounceTime(100),
        map(([[data, symbolInfo, accountInfo], markPrices]) => {
          // console.log("obser", data);
          let totalCollateral = 0;

          return data?.map((item) => {
            const price = (markPrices as any)[item.symbol] ?? item.mark_price;
            const info = symbolInfo?.[item.symbol];
            // console.log("info", info("base_mmr"));

            const MMR = positions.MMR({
              baseMMR: info("base_mmr"),
              baseIMR: info("base_imr"),
              IMRFactor: accountInfo.imr_factor[info("base")],
              positionNotional: positions.notional(item.position_qty, price),
              IMR_factor_power: 4 / 5,
            });

            // console.log("MMR", MMR);

            return {
              ...item,
              mark_price: price,
              est_liq_price: positions.liqPrice({
                markPrice: price,
                totalCollateral,
                positionQty: item.position_qty,
                MMR,
              }),
              notional: positions.notional(
                item.position_qty,
                item.average_open_price
              ),
              unrealized_pnl: positions.unrealizedPnL({
                qty: item.position_qty,
                openPrice: item.average_open_price,
                markPrice: price,
              }),
            };
          });
        })
      ),
    undefined,
    [data?.rows, symbolInfo, accountInfo]
  );

  // 合计数据
  const aggregatedData = useMemo(() => {
    const aggregatedData = {
      unsettledPnL: NaN,
      unrealPnL: NaN,
      notional: NaN,
    };

    if (value && value.length) {
      aggregatedData.unrealPnL = positions.totalUnrealizedPnL(value);
      aggregatedData.notional = positions.totalNotional(value);
      aggregatedData.unsettledPnL = positions.totalUnsettlementPnL(
        value.map((item) => ({
          ...item,
          sum_unitary_funding: fundingRates[item.symbol]?.(
            "sum_unitary_funding",
            0
          ),
        }))
      );
    }

    return aggregatedData;
  }, [value, fundingRates]);

  const showSymbol = useCallback((symbol: string) => {
    setVisibleSymbol(symbol);
  }, []);

  return [
    { rows: value, aggregated: aggregatedData },
    createGetter<Omit<API.Position, "rows">>(data as any, 1),
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
