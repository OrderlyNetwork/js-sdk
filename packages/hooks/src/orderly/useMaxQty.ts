import { useEffect, useMemo } from "react";
import { type API, OrderSide, OrderStatus } from "@orderly.network/types";

import { useSymbolsInfo } from "./useSymbolsInfo";

import { useMarkPricesStream } from "./useMarkPricesStream";
import { account } from "@orderly.network/perp";
import { useCollateral } from "./useCollateral";

import { pathOr } from "ramda";
import { useOrderStream } from "./useOrderStream/useOrderStream";
import { usePositions } from "./usePositionStream/usePosition.store";
import { useAccountInfo } from "./appStore";

// const positionsPath = pathOr([], [0, "rows"]);

/**
 * @param symbol
 * @param side
 * @param reduceOnly
 * @returns the maximum quantity available for trading in USD
 */
export const useMaxQty = (
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean = false
) => {
  // const positionsData = usePositionStream();

  const positions = usePositions();

  const [orders] = useOrderStream({ status: OrderStatus.NEW, size: 500 });

  // const { data: accountInfo } =
  //   usePrivateQuery<API.AccountInfo>("/v1/client/info");

  const accountInfo = useAccountInfo();

  const symbolInfo = useSymbolsInfo();

  const { totalCollateral } = useCollateral();

  const { data: markPrices } = useMarkPricesStream();

  // const [orders] = useOrderStream({ status: OrderStatus.NEW });

  const maxQty = useMemo(() => {
    if (!symbol) return 0;

    // const positions = positionsPath(positionsData);

    const positionQty = account.getQtyFromPositions(
      positions === null ? [] : positions,
      symbol
    );

    if (reduceOnly) {
      if (positionQty > 0) {
        if (side === OrderSide.BUY) {
          return 0;
        } else {
          return Math.abs(positionQty);
        }
      }

      if (positionQty < 0) {
        if (side === OrderSide.BUY) {
          return Math.abs(positionQty);
        } else {
          return 0;
        }
      }

      return 0;
    }

    if (!markPrices || !markPrices[symbol] || !orders || !accountInfo) return 0;

    const getSymbolInfo = symbolInfo[symbol];

    const filterAlgoOrders = orders.filter(
      (item) => item.algo_order_id === undefined
    );

    // current symbol buy order quantity
    const buyOrdersQty = account.getQtyFromOrdersBySide(
      filterAlgoOrders,
      symbol,
      OrderSide.BUY
    );
    // current symbol sell order quantity
    const sellOrdersQty = account.getQtyFromOrdersBySide(
      filterAlgoOrders,
      symbol,
      OrderSide.SELL
    );

    const otherPositions = !Array.isArray(positions)
      ? []
      : positions.filter((item: API.Position) => item.symbol !== symbol);

    const otherOrders = filterAlgoOrders.filter(
      (item: API.Order) => item.symbol !== symbol
    );

    const otherIMs = account.otherIMs({
      orders: otherOrders,
      positions: otherPositions,
      symbolInfo,
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
      maxLeverage: accountInfo.max_leverage,
    });

    return account.maxQty(side, {
      markPrice: markPrices[symbol],
      symbol,
      baseMaxQty: getSymbolInfo("base_max"),
      totalCollateral,
      maxLeverage: accountInfo.max_leverage,
      takerFeeRate: accountInfo.futures_taker_fee_rate,
      baseIMR: getSymbolInfo("base_imr"),
      otherIMs,
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
      IMR_Factor: accountInfo.imr_factor[symbol],
    });
  }, [
    orders,
    // positionsData,
    markPrices,
    accountInfo,
    symbolInfo,
    symbol,
    side,
    totalCollateral,
    reduceOnly,
  ]);

  // console.log("+++++++++++maxQty++++++++++++++ ", maxQty);
  // return 0;

  return Math.max(maxQty, 0) as number;
};
