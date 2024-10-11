import { useEffect, useMemo, useState } from "react";
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
import { usePositionActions, usePositionStore } from "./usePositionStore";
import { useCalculatorService } from "../../useCalculatorService";
import { CalculatorScope } from "../../types";
import { useAppStore } from "../appStore";
import { omit } from "ramda";
// import { usePosition } from "./usePosition";

export type PriceMode = "markPrice" | "lastPrice";

export const usePositionStream = (
  /**
   * If symbol is passed, only the position of that symbol will be returned.
   */
  symbol?: string,
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
  const symbolInfo = useSymbolsInfo();
  // const {setPositions} = usePositionActions();

  const { includedPendingOrder = false } = options || {};

  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  // get TP/SL orders;

  const [tpslOrders] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  });
  //

  // console.log("---------------");

  const [priceMode, setPriceMode] = useState(options?.calcMode || "markPrice");

  useEffect(() => {
    if (options?.calcMode && priceMode !== options?.calcMode) {
      setPriceMode(options?.calcMode);
    }
  }, [options?.calcMode]);

  const formattedPositions: [
    API.PositionTPSLExt[],
    Omit<API.PositionsTPSLExt, "rows">
  ] = usePositionStore((state) => [
    state.positions.rows,
    omit(["rows"], state.positions),
  ]);

  const { totalCollateral, totalValue, totalUnrealizedROI } = useAppStore(
    (state) => state.portfolio
  );

  const positionInfoGetter = createGetter<
    Omit<API.PositionInfo, "rows">,
    keyof Omit<API.PositionInfo, "rows">
  >(formattedPositions[1] as any, 1);

  return [
    {
      // rows: positionsRows,
      rows: formattedPositions[0],
      aggregated: {
        ...(formattedPositions?.[1] ?? {}),
        unrealPnlROI: totalUnrealizedROI,
      },
      totalCollateral,
      totalValue,
      totalUnrealizedROI,
    },
    positionInfoGetter,
    {
      /**
       * @deprecated use `isLoading` instead
       */
      // loading: isLoading,
      // isLoading,
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
