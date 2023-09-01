import { useObservable } from "rxjs-hooks";
import { useWebSocketClient } from "../useWebSocketClient";
import { usePrivateQuery } from "../usePrivateQuery";

import { merge } from "rxjs";
import { map, filter, debounceTime } from "rxjs/operators";
import { usePositionStream } from "./usePositionStream";
import { pathOr } from "ramda";
import { account } from "@orderly.network/futures";
// import { useOrderStream } from "./useOrderStream";
import { type WSMessage, type API } from "@orderly.network/types";
import { useAccount } from "../useAccount";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, zero } from "@orderly.network/utils";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMemo } from "react";

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
  // const { data: positions } = usePrivateQuery<API.PositionInfo>(`/positions`);

  // const orders = useOrderStream();
  const { data: orders } = usePrivateQuery<API.Order[]>(`/orders`);
  // const { info: accountInfo } = useAccount();
  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/client/info");

  const symbolInfo = useSymbolsInfo();

  const { data: markPrices } = useMarkPricesStream();

  const { data: holding } = usePrivateQuery<API.Holding[]>("/client/holding", {
    formatter: (data) => {
      return data.holding;
    },
  });

  const [totalCollateral, totalValue] = useMemo(() => {
    if (!holding || !markPrices) {
      return [zero, zero];
    }
    const unsettlemnedPnL = totalUnsettlementPnLPath(positions);

    // console.log("unsettlemnedPnL", unsettlemnedPnL);
    //取出 USDC
    const nonUSDC: {
      holding: number;
      markPrice: number;
      //保證金替代率 暂时默认0
      discount: number;
    }[] = [];

    let USDC_holding = 0;

    holding.forEach((item) => {
      if (item.token === "USDC") {
        USDC_holding = item.holding;
      } else {
        nonUSDC.push({
          holding: item.holding,
          markPrice: markPrices[item.token] ?? 0,
          // markPrice: 0,
          discount: 0,
        });
      }
    });

    const number = account.totalCollateral({
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
      unsettlementPnL: unsettlemnedPnL,
    });

    const totalValue = account.totalValue({
      totalUnsettlementPnL: unsettlemnedPnL,
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
    });

    return [new Decimal(number), totalValue];
  }, [holding, positions, markPrices]);

  const totalInitialMarginWithOrders = useMemo(() => {
    if (!accountInfo || !symbolInfo || !markPrices) {
      return 0;
    }

    return account.totalInitialMarginWithOrders({
      positions: positionsPath(positions),
      orders: orders ?? [],
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
      maxLeverage: accountInfo.max_leverage,
      symbolInfo,
    });
  }, [positions, orders, markPrices, accountInfo, symbolInfo]);

  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: account
      .freeCollateral({
        totalCollateral,
        totalInitialMarginWithOrders,
      })
      .toDecimalPlaces(dp)
      .toNumber(),
    totalValue: totalValue.toDecimalPlaces(dp).toNumber(),
  };
};
