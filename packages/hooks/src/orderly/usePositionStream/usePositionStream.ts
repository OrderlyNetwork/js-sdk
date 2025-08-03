import { useEffect, useMemo, useRef } from "react";
import { pathOr } from "ramda";
import { omit } from "ramda";
import { type SWRConfiguration } from "swr";
import {
  AlgoOrderRootType,
  EMPTY_OBJECT,
  OrderStatus,
  type API,
} from "@orderly.network/types";
import { useApiStatusStore } from "../../next/apiStatus/apiStatus.store";
import { CalculatorScope } from "../../types";
import { useCalculatorService } from "../../useCalculatorService";
import { createGetter } from "../../utils/createGetter";
import { useAppStore } from "../appStore";
import { PositionCalculator } from "../calculator/positions";
import { useOrderStream } from "../orderlyHooks";
import { POSITION_EMPTY, usePositionStore } from "./usePosition.store";
import { findPositionTPSLFromOrders, findTPSLFromOrder } from "./utils";

// import { usePosition } from "./usePosition";

export type PriceMode = "markPrice" | "lastPrice";

const scopes = [
  CalculatorScope.POSITION,
  CalculatorScope.MARK_PRICE,
  CalculatorScope.INDEX_PRICE,
];

export const usePositionStream = (
  /**
   * If symbol is passed, only the position of that symbol will be returned.
   */
  symbol: string = "all",
  options?: SWRConfiguration & {
    calcMode?: PriceMode;
    /**
     * If true, the pending order will be included in the result.
     */
    includedPendingOrder?: boolean;
  },
) => {
  const { calcMode } = options || {};

  const { includedPendingOrder = false } = options || {};

  const positionCalculator = useRef<PositionCalculator | null>(null);
  const calculatorService = useCalculatorService();

  const [tpslOrders] = useOrderStream(
    {
      symbol: symbol === "all" ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      size: 500,
    },
    {
      keeplive: true,
    },
  );

  const { positions: positionStatus } = useApiStatusStore(
    (state) => state.apis,
  );

  useEffect(() => {
    if (symbol === "all") {
      return;
    }
    positionCalculator.current = new PositionCalculator(symbol);
    for (const scope of scopes) {
      calculatorService.register(scope, positionCalculator.current);
    }
    return () => {
      for (const scope of scopes) {
        calculatorService.unregister(scope, positionCalculator.current!);
      }
    };
  }, [symbol]);

  const formattedPositions: [
    API.PositionTPSLExt[] | null,
    Omit<API.PositionsTPSLExt, "rows">,
  ] = usePositionStore((state) => {
    const positions = state.positions[symbol] ?? POSITION_EMPTY;

    // console.log("******", symbol, state.positions);

    return [positions.rows, omit(["rows"], positions)];
  });

  const { totalCollateral, totalValue, totalUnrealizedROI } = useAppStore(
    (state) => state.portfolio,
  );

  const aggregated = useMemo(() => {
    const data = formattedPositions[1];
    if (!data) {
      return {};
    }

    if (calcMode === "markPrice") {
      return data;
    }

    const { total_unreal_pnl_index, unrealPnlROI_index, ...rest } = data;

    return {
      ...rest,
      unrealPnL: total_unreal_pnl_index,
      total_unreal_pnl: total_unreal_pnl_index,
      unrealPnlROI: unrealPnlROI_index,
    };
  }, [calcMode]);

  let rows = formattedPositions[0];
  {
    // rows
    if (!rows) {
      rows = [];
    }

    // rows.forEach((item) => {
    //   if (item.position_qty > 0) {
    //     console.log(markPrices.data[item.symbol], item.mark_price);
    //   }
    // });

    if (!includedPendingOrder) {
      rows = rows.filter((item) => item.position_qty !== 0);
    } else {
      rows = rows.filter(
        (item) =>
          item.position_qty !== 0 ||
          item.pending_long_qty !== 0 ||
          item.pending_short_qty !== 0,
      );
    }

    if (calcMode === "lastPrice") {
      rows = rows.map((item) => {
        const {
          unrealized_pnl_index,
          unrealized_pnl_ROI_index,

          ...rust
        } = item;

        return {
          ...rust,
          unrealized_pnl: unrealized_pnl_index ?? 0,
          unsettled_pnl_ROI: unrealized_pnl_ROI_index ?? 0,
          // mark_price: item.last_price,
        };
      });
    }

    // console.log("tpslOrders", tpslOrders);

    if (Array.isArray(tpslOrders) && tpslOrders.length) {
      rows = rows.map((item) => {
        const related_order = findPositionTPSLFromOrders(
          tpslOrders,
          item.symbol,
        );

        const tp_sl_pricer = !!related_order
          ? findTPSLFromOrder(related_order)
          : undefined;

        return {
          ...item,
          tp_trigger_price: tp_sl_pricer?.tp_trigger_price,
          sl_trigger_price: tp_sl_pricer?.sl_trigger_price,
          algo_order: related_order,
        };
      });
    }
  }

  const positionInfoGetter = createGetter(
    aggregated as Omit<API.PositionInfo, "rows">,
    1,
  );

  return [
    {
      rows,
      // rows: formattedPositions[0],
      aggregated: formattedPositions?.[1] ?? EMPTY_OBJECT,
      totalCollateral,
      totalValue,
      totalUnrealizedROI,
    },
    positionInfoGetter,
    {
      /**
       * @deprecated use `isLoading` instead
       */
      loading: positionStatus.loading,
      isLoading: positionStatus.loading,
      // isValidating,
      // // showSymbol,
      // error,
      // // loadMore: () => {},
      // refresh: refreshPositions,
    },
  ] as const;
};

export const pathOr_unsettledPnLPathOr = pathOr(0, [
  0,
  "aggregated",
  "unsettledPnL",
]);
