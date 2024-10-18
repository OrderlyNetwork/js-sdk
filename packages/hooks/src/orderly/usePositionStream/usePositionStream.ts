import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivateQuery } from "../../usePrivateQuery";
import { account, positions } from "@orderly.network/perp";
import { type SWRConfiguration } from "swr";
import { createGetter } from "../../utils/createGetter";
import { useFundingRates } from "../useFundingRates";
import {
  type API,
  OrderEntity,
  AlgoOrderType,
  AlgoOrderRootType,
  OrderStatus,
} from "@orderly.network/types";
import { useSymbolsInfo } from "../useSymbolsInfo";
import { useMarkPricesStream } from "../useMarkPricesStream";
import { pathOr, propOr } from "ramda";
import { parseHolding } from "../../utils/parseHolding";
import { Decimal, zero } from "@orderly.network/utils";
import { useMarketsStream } from "../useMarketsStream";
import { useOrderStream } from "../orderlyHooks";
import {
  findPositionTPSLFromOrders,
  findTPSLFromOrder,
  findTPSLFromOrders,
} from "./utils";
import {
  POSITION_EMPTY,
  usePositionActions,
  usePositionStore,
} from "./usePositionStore";
import { useCalculatorService } from "../../useCalculatorService";
import { CalculatorScope } from "../../types";
import { useAppStore } from "../appStore";
import { omit } from "ramda";
import { PositionCalculator } from "../calculator/positions";
import { useApiStatusStore } from "../../next/apiStatus/apiStatus.store";
// import { usePosition } from "./usePosition";

export type PriceMode = "markPrice" | "lastPrice";

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
  }
) => {
  // const updatePosition = usePosition((state) => state.updatePosition);
  //
  // const symbolInfo = useSymbolsInfo();
  // const {setPositions} = usePositionActions();

  const { includedPendingOrder = false } = options || {};

  const positionCalculator = useRef<PositionCalculator | null>(null);
  const calcutlatorService = useCalculatorService();

  // const { data: accountInfo } =
  //   usePrivateQuery<API.AccountInfo>("/v1/client/info");

  // get TP/SL orders;

  // const [tpslOrders] = useOrderStream({
  //   status: OrderStatus.INCOMPLETE,
  //   includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  // });
  //

  const { positions: positionStatus } = useApiStatusStore(
    (state) => state.apis
  );

  const [priceMode, setPriceMode] = useState(options?.calcMode || "markPrice");

  useEffect(() => {
    if (symbol === "all") return;

    // console.log("---------------", symbol);

    positionCalculator.current = new PositionCalculator(symbol);

    calcutlatorService.register(
      CalculatorScope.POSITION,
      positionCalculator.current
    );

    return () => {
      calcutlatorService.unregister(
        CalculatorScope.POSITION,
        positionCalculator.current!
      );
    };
  }, [symbol]);

  useEffect(() => {
    if (options?.calcMode && priceMode !== options?.calcMode) {
      setPriceMode(options?.calcMode);
    }
  }, [options?.calcMode]);

  const formattedPositions: [
    API.PositionTPSLExt[],
    Omit<API.PositionsTPSLExt, "rows">
  ] = usePositionStore((state) => {
    const positions = state.positions[symbol] ?? POSITION_EMPTY;
    return [positions.rows, omit(["rows"], positions)];
  });

  const { totalCollateral, totalValue, totalUnrealizedROI } = useAppStore(
    (state) => state.portfolio
  );

  const positionInfoGetter = createGetter<
    Omit<API.PositionInfo, "rows">,
    keyof Omit<API.PositionInfo, "rows">
  >(formattedPositions[1] as any, 1);

  const positionsRows = useMemo(() => {
    let rows = formattedPositions[0];
    if (!includedPendingOrder) {
      rows = rows.filter((item) => item.position_qty !== 0);
    } else {
      rows = rows.filter(
        (item) =>
          item.position_qty !== 0 ||
          item.pending_long_qty !== 0 ||
          item.pending_short_qty !== 0
      );
    }

    return rows;
  }, [formattedPositions, includedPendingOrder]);

  return [
    {
      rows: positionsRows,
      // rows: formattedPositions[0],
      aggregated: formattedPositions?.[1] ?? {},
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
