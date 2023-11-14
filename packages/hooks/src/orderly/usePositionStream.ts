import { useMemo } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { account, positions } from "@orderly.network/futures";
import { type SWRConfiguration } from "swr";
import { createGetter } from "../utils/createGetter";
import { useFundingRates } from "./useFundingRates";
import { type API, OrderEntity } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { pathOr, propOr } from "ramda";
import { parseHolding } from "../utils/parseHolding";
import { Decimal, zero } from "@orderly.network/utils";

export interface PositionReturn {
  data: any[];
  loading: boolean;
  close: (
    order: Pick<OrderEntity, "order_type" | "order_price" | "side">
  ) => void;
}

export const usePositionStream = (
  symbol?: string,
  options?: SWRConfiguration
) => {
  const symbolInfo = useSymbolsInfo();
  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  const { data: holding } = usePrivateQuery<API.Holding[]>(
    "/v1/client/holding",
    {
      formatter: (data) => {
        return data.holding;
      },
    }
  );

  const fundingRates = useFundingRates();

  const {
    data,
    error,
    // mutate: updatePositions,
  } = usePrivateQuery<API.PositionInfo>(`/v1/positions`, {
    // revalidateOnFocus: false,
    // revalidateOnReconnect: false,
    // dedupingInterval: 100,
    // keepPreviousData: false,
    // revalidateIfStale: true,
    ...options,

    formatter: (data) => data,
    onError: (err) => {},
  });

  //

  const { data: markPrices } = useMarkPricesStream();

  const formatedPositions = useMemo<[API.PositionExt[], any] | null>(() => {
    if (!data?.rows || !symbolInfo || !accountInfo) return null;

    const filteredData =
      typeof symbol === "undefined" || symbol === ""
        ? data.rows
        : data.rows.filter((item) => {
            return item.symbol === symbol;
          });

    let unrealPnL_total = zero,
      notional_total = zero,
      unsettlementPnL_total = zero;

    const formatted = filteredData.map((item: API.Position) => {
      // const price = (markPrices as any)[item.symbol] ?? item.mark_price;
      const price = propOr(
        item.mark_price,
        item.symbol,
        markPrices
      ) as unknown as number;

      const info = symbolInfo?.[item.symbol];
      //

      const notional = positions.notional(item.position_qty, price);

      const unrealPnl = positions.unrealizedPnL({
        qty: item.position_qty,
        openPrice: item.average_open_price,
        markPrice: price,
      });

      const imr = account.IMR({
        maxLeverage: accountInfo.max_leverage,
        baseIMR: info("base_imr"),
        IMR_Factor: accountInfo.imr_factor[item.symbol] as number,
        positionNotional: notional,
        ordersNotional: 0,
        IMR_factor_power: 4 / 5,
      });

      const unrealPnlROI = positions.unrealizedPnLROI({
        positionQty: item.position_qty,
        openPrice: item.average_open_price,
        IMR: imr,
        unrealizedPnL: unrealPnl,
      });

      const unsettlementPnL = positions.unsettlementPnL({
        positionQty: item.position_qty,
        markPrice: price,
        costPosition: item.cost_position,
        sumUnitaryFunding: fundingRates[item.symbol]?.(
          "sum_unitary_funding",
          0
        ),
        lastSumUnitaryFunding: item.last_sum_unitary_funding,
      });

      unrealPnL_total = unrealPnL_total.add(unrealPnl);
      notional_total = notional_total.add(notional);
      unsettlementPnL_total = unsettlementPnL_total.add(unsettlementPnL);

      return {
        ...item,
        mark_price: price,
        mm: 0,
        notional,
        unsettlement_pnl: unsettlementPnL,
        unrealized_pnl: unrealPnl,
        unsettled_pnl_ROI: unrealPnlROI,
      };
    });

    return [
      formatted,
      {
        unrealPnL: unrealPnL_total.toNumber(),
        notional: notional_total.toNumber(),
        unsettledPnL: unsettlementPnL_total.toNumber(),
      },
    ];
  }, [data?.rows, symbolInfo, accountInfo, markPrices, symbol, holding]);

  // const showSymbol = useCallback((symbol: string) => {
  //   setVisibleSymbol(symbol);
  // }, []);

  const [totalCollateral, totalValue, totalUnrealizedROI] = useMemo<
    [Decimal, Decimal, number]
  >(() => {
    if (!holding || !markPrices) {
      return [zero, zero, 0];
    }
    const unsettlemnedPnL = pathOr(0, [1, "unsettledPnL"])(formatedPositions);
    const unrealizedPnL = pathOr(0, [1, "unrealPnL"])(formatedPositions);

    const [USDC_holding, nonUSDC] = parseHolding(holding, markPrices);

    const totalCollateral = account.totalCollateral({
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
      unsettlementPnL: unsettlemnedPnL,
    });

    const totalValue = account.totalValue({
      totalUnsettlementPnL: unsettlemnedPnL,
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
    });

    const totalUnrealizedROI = account.totalUnrealizedROI({
      totalUnrealizedPnL: unrealizedPnL,
      totalValue: totalValue.toNumber(),
    });

    return [totalCollateral, totalValue, totalUnrealizedROI];
  }, [holding, formatedPositions, markPrices]);

  const positionsRows = useMemo(() => {
    if (!formatedPositions) return null;

    if (!symbolInfo || !accountInfo) return formatedPositions[0];

    const total = totalCollateral.toNumber();

    return formatedPositions[0]
      .filter((item) => item.position_qty !== 0)
      .map((item) => {
        const info = symbolInfo?.[item.symbol];

        const MMR = positions.MMR({
          baseMMR: info("base_mmr"),
          baseIMR: info("base_imr"),
          IMRFactor: accountInfo.imr_factor[item.symbol] as number,
          positionNotional: item.notional,
          IMR_factor_power: 4 / 5,
        });

        return {
          ...item,
          mm: positions.maintenanceMargin({
            positionQty: item.position_qty,
            markPrice: item.mark_price,
            MMR,
          }),
          est_liq_price: positions.liqPrice({
            markPrice: item.mark_price,
            totalCollateral: total,
            positionQty: item.position_qty,
            MMR,
          }),
          MMR,
        };
      });
  }, [formatedPositions, symbolInfo, accountInfo, totalCollateral]);

  // useEffect(() => {
  //   ee.on("positions:changed", () => {
  //     updatePositions();
  //   });
  // }, []);

  return [
    {
      rows: positionsRows,
      aggregated: formatedPositions?.[1] ?? {},
      totalCollateral,
      totalValue,
      totalUnrealizedROI,
    },
    createGetter<Omit<API.Position, "rows">>(data as any, 1),
    {
      // close: onClosePosition,
      loading: false,
      // showSymbol,
      error,
      loadMore: () => {},
      refresh: () => {},
    },
  ] as const;
};

export const pathOr_unsettledPnLPathOr = pathOr(0, [
  0,
  "aggregated",
  "unsettledPnL",
]);
