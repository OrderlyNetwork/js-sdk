import { useMemo } from "react";
import { type API, OrderSide, type WSMessage } from "@orderly.network/types";
import { usePositionStream } from "./usePositionStream";
import { useOrderStream } from "./useOrderStream";
import { useAccount } from "../useAccount";
import { useSymbolsInfo } from "./useSymbolsInfo";

import { useMarkPriceStream } from "./useMarkPriceStream";
import { account } from "@orderly.network/futures";
import { useObservable } from "rxjs-hooks";
import { map, filter, distinct, tap, switchMap } from "rxjs/operators";
import { useCollateral } from "./useCollateral";
import { pathOr } from "ramda";
import { iif } from "rxjs";

const positionsPath = pathOr([], [0, "rows"]);

export const useMaxQty = (
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean = false
) => {
  //   const ws = useWebSocketClient();
  const positions = usePositionStream();
  const orders = useOrderStream();
  const { info: accountInfo } = useAccount();
  const symbolInfo = useSymbolsInfo();

  const { totalCollateral } = useCollateral();

  const markPrices = useMarkPriceStream();

  const maxQty = useObservable<number, any>(
    (_, input$) =>
      input$.pipe(
        switchMap(([{ reduceOnly }]) =>
          iif(
            () => reduceOnly,
            input$.pipe(
              filter(([{ positions }]) => positions.length > 0),
              map(
                ([
                  {
                    positions,

                    symbol,
                    side,
                  },
                ]) => {
                  const positionQty = account.getQtyFromPositions(
                    positions,
                    symbol
                  );

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
              )
            ),
            input$.pipe(
              filter(
                ([
                  {
                    markPrices,
                    positions,
                    orders,
                    accountInfo,
                    symbolInfo,
                    symbol,
                    side,
                    totalCollateral,
                  },
                ]) =>
                  !!symbol &&
                  !!side &&
                  !!markPrices[symbol] &&
                  !!positions &&
                  !!orders &&
                  !!accountInfo &&
                  !!symbolInfo &&
                  !!totalCollateral
              ),
              // 数据准备
              map(
                ([
                  {
                    markPrices,
                    positions,
                    orders,
                    accountInfo,
                    symbolInfo,
                    symbol,
                    side,
                    totalCollateral,
                  },
                ]) => {
                  const getSymbolInfo = symbolInfo[symbol];
                  // 当前symbol的仓位
                  const positionQty = account.getQtyFromPositions(
                    positions,
                    symbol
                  );
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

                  // console.log("otherIMs", otherIMs);

                  return [
                    side,
                    {
                      markPrice: markPrices[symbol],

                      baseMaxQty: getSymbolInfo("base_max"),
                      totalCollateral,
                      maxLeverage: accountInfo.max_leverage,
                      baseIMR: getSymbolInfo("base_imr"),
                      otherIMs,
                      positionQty,
                      buyOrdersQty,
                      sellOrdersQty,
                      IMR_Factor: accountInfo.imr_factor[getSymbolInfo("base")],
                    },
                    {
                      dp: getSymbolInfo("base_tick"),
                    },
                  ];
                }
              ),
              map(([side, inputs, options]) => {
                const maxQty = account.maxQty(side, inputs);

                // console.log("maxQty", side, maxQty, options);

                return maxQty;
              }),
              distinct()
              // tap((data: number) => console.log("************", data))
            )
          )
        )
      ),
    0,
    [
      {
        markPrices,
        positions: positionsPath(positions),
        orders: orders[0] ?? [],
        accountInfo,
        symbolInfo,
        symbol,
        side,
        totalCollateral,
        reduceOnly,
      },
    ]
  );

  return maxQty;
};
