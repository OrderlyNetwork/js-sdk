import { useObservable } from "rxjs-hooks";
import { useWebSocketClient } from "../useWebSocketClient";
import { usePrivateQuery } from "../usePrivateQuery";

import { merge } from "rxjs";
import { map, filter } from "rxjs/operators";
import { usePositionStream } from "./usePositionStream";
import { pathOr } from "ramda";
import { account } from "@orderly/futures";
import { useOrderStream } from "./useOrderStream";
import { WSMessage, API } from "@orderly/types";
import { useAccount } from "../useAccount";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, zero } from "@orderly/utils";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
};

const totalUnsettlementPnLPath = pathOr(0, [0, "aggregated", "unsettledPnL"]);
const positionsPath = pathOr([], [0, "rows"]);

/**
 * 用户保证金
 * @returns
 */
export const useCollateral = (dp: number = 6): CollateralOutputs => {
  const ws = useWebSocketClient();

  const positions = usePositionStream();
  const orders = useOrderStream();
  const { info: accountInfo } = useAccount();
  const symbolInfo = useSymbolsInfo();

  const markPrices = useObservable(
    () =>
      ws.observe("markprices").pipe(
        map((data: WSMessage.MarkPrice[]) => {
          const prices: { [key: string]: number } = {};

          data.forEach((item) => {
            prices[item.symbol] = item.price;
          });
          return prices;
        })
      ),
    {}
  );

  // console.log("----- markPrices", markPrices);

  const { data } = usePrivateQuery<API.Holding[]>("/client/holding", {
    formatter: (data) => {
      return data.holding;
    },
  });

  const totalCollateral = useObservable<Decimal, any>(
    (_, input$) =>
      merge(input$).pipe(
        filter((data) => !!data[0]),
        map(([data, unsettlemnedPnL]: [API.Holding[], number]) => {
          console.log(data);
          //取出 USDC
          const nonUSDC: API.Holding[] = [];
          let USDC_holding = 0;

          data.forEach((item) => {
            if (item.token === "USDC") {
              USDC_holding = item.holding;
            } else {
              nonUSDC.push(item);
            }
          });

          const number = account.totalCollateral({
            USDCHolding: USDC_holding,
            nonUSDCHolding: nonUSDC,
            unsettlementPnL: unsettlemnedPnL,
          });

          return new Decimal(number);
        })
      ),
    zero,
    [data, totalUnsettlementPnLPath(positions)]
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
  };
};
