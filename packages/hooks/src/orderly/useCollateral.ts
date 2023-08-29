import { useObservable } from "rxjs-hooks";
import { useWebSocketClient } from "../useWebSocketClient";
import { usePrivateQuery } from "../usePrivateQuery";

import { merge } from "rxjs";
import { map, filter, debounceTime } from "rxjs/operators";
import { usePositionStream } from "./usePositionStream";
import { pathOr } from "ramda";
import { account } from "@orderly.network/futures";
import { useOrderStream } from "./useOrderStream";
import { type WSMessage, type API } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, zero } from "@orderly.network/utils";
import { useMarkPriceStream } from "./useMarkPriceStream";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number;
};

const totalUnsettlementPnLPath = pathOr(0, [0, "aggregated", "unsettledPnL"]);
const positionsPath = pathOr([], [0, "rows"]);

/**
 * 用户保证金
 * @returns
 */
export const useCollateral = (dp: number = 6): CollateralOutputs => {
  const positions = usePositionStream();
  const orders = useOrderStream();
  const { info: accountInfo } = useAccount();
  const symbolInfo = useSymbolsInfo();

  const markPrices = useMarkPriceStream();

  // console.log("----- markPrices", markPrices);

  const { data } = usePrivateQuery<API.Holding[]>("/client/holding", {
    formatter: (data) => {
      return data.holding;
    },
  });

  const totalCollateral = useObservable<Decimal, any>(
    (_, input$) =>
      merge(input$).pipe(
        debounceTime(100),
        filter((data) => !!data[0]),
        map(
          ([data, unsettlemnedPnL, markPrices]: [
            API.Holding[],
            number,
            any
          ]) => {
            //取出 USDC
            const nonUSDC: {
              holding: number;
              markPrice: number;
              //保證金替代率 暂时默认0
              discount: number;
            }[] = [];
            let USDC_holding = 0;

            data.forEach((item) => {
              if (item.token === "USDC") {
                USDC_holding = item.holding;
              } else {
                nonUSDC.push({
                  holding: item.holding,
                  // markPrice: markPrices[item.token] ?? 0,
                  markPrice: 0,
                  discount: 0,
                });
              }
            });

            const number = account.totalCollateral({
              USDCHolding: USDC_holding,
              nonUSDCHolding: nonUSDC,
              unsettlementPnL: unsettlemnedPnL,
            });

            return new Decimal(number);
          }
        )
      ),
    zero,
    [data, totalUnsettlementPnLPath(positions), markPrices]
  );

  const totalInitialMarginWithOrders = useObservable<any, any>(
    (_, input$) =>
      input$.pipe(
        filter((data) => !!data[3] && !!data[4]),
        map(([positions, orders, markPrices, accountInfo, symbolInfo]) => {
          return account.totalInitialMarginWithOrders({
            positions: positionsPath(positions),
            orders: orders?.[0] ?? [],
            markPrices,
            IMR_Factors: accountInfo.imr_factor,
            maxLeverage: accountInfo.max_leverage,
            symbolInfo,
          });
          // return 0;
        })
      ),
    0,
    [positions, orders, markPrices, accountInfo, symbolInfo]
  );

  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: account
      .freeCollateral({
        totalCollateral,
        totalInitialMarginWithOrders,
      })
      .toDecimalPlaces(dp)
      .toNumber(),
    totalValue: 0,
  };
};
