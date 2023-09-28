import { useMemo } from "react";
import { type API, OrderSide, type WSMessage } from "@orderly.network/types";

import { useSymbolsInfo } from "./useSymbolsInfo";

import { useMarkPricesStream } from "./useMarkPricesStream";
import { account } from "@orderly.network/futures";
import { useCollateral } from "./useCollateral";

import { usePrivateQuery } from "../usePrivateQuery";
import { usePositionStream } from "./usePositionStream";
import { pathOr } from "ramda";

const positionsPath = pathOr([], [0, "rows"]);

export const useMaxQty = (
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean = false
) => {
  const positionsData = usePositionStream();

  // const { data: positions = [] } =
  //   usePrivateQuery<API.PositionInfo>(`/positions`);

  const { data: orders } = usePrivateQuery<API.Order[]>(
    `/v1/orders?status=NEW`
  );

  // const { info: accountInfo } = useAccount();
  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  const symbolInfo = useSymbolsInfo();

  const { totalCollateral } = useCollateral();

  const { data: markPrices } = useMarkPricesStream();

  const maxQty = useMemo(() => {
    if (!symbol) return 0;

    const positions = positionsPath(positionsData);

    const positionQty = account.getQtyFromPositions(positions, symbol);

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
    // 当前symbol的仓位

    // 当前symbol的买单
    const buyOrdersQty = account.getQtyFromOrdersBySide(
      orders,
      symbol,
      OrderSide.BUY
    );
    // 当前symbol的卖单
    const sellOrdersQty = account.getQtyFromOrdersBySide(
      orders,
      symbol,
      OrderSide.SELL
    );

    const otherPositions = positions.filter(
      (item: API.Position) => item.symbol !== symbol
    );

    const otherOrders = orders.filter(
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
      takerFeeRate: accountInfo.taker_fee_rate,
      baseIMR: getSymbolInfo("base_imr"),
      otherIMs,
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
      IMR_Factor: accountInfo.imr_factor[symbol],
    });
  }, [
    orders,
    positionsData,
    markPrices,
    accountInfo,
    symbolInfo,
    symbol,
    side,
    totalCollateral,
    reduceOnly,
  ]);

  return maxQty;
};
