import { usePrivateQuery } from "../usePrivateQuery";

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
import { useBalance } from "./useBalance";
import { parseHolding } from "../utils/parseHolding";
import { totalUnsettlementPnLPath } from "../utils/fn";
import { useHolding } from "./useHolding";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number;
  availableBalance: number;
};

const positionsPath = pathOr([], [0, "rows"]);
const totalCollateralPath = pathOr(0, [0, "totalCollateral"]);
const unsettledPnL = pathOr(0, [0, "aggregated", "unsettledPnL"]);

/**
 * 用户保证金
 * @returns
 */

type Options = {
  dp: number;
};
export const useCollateral = (
  options: Options = { dp: 6 }
): CollateralOutputs => {
  const { dp } = options;
  const positions = usePositionStream();

  // const orders = useOrderStream();
  const { data: orders } = usePrivateQuery<API.Order[]>(`/v1/orders`);
  // const { info: accountInfo } = useAccount();
  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  const symbolInfo = useSymbolsInfo();

  const { data: markPrices } = useMarkPricesStream();

  const { usdc } = useHolding();

  // const { data: holding } = usePrivateQuery<API.Holding[]>(
  //   "/v1/client/holding",
  //   {
  //     formatter: (data) => {
  //       return data.holding;
  //     },
  //   }
  // );

  const [totalCollateral, totalValue] = useMemo(() => {
    return [
      pathOr(zero, [0, "totalCollateral"], positions),
      pathOr(zero, [0, "totalValue"], positions),
    ];
  }, [positions, markPrices]);

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

  const freeCollateral = useMemo(() => {
    return account.freeCollateral({
      totalCollateral,
      totalInitialMarginWithOrders,
    });
  }, [totalCollateral, totalInitialMarginWithOrders]);

  const availableBalance = useMemo(() => {
    return account.availableBalance({
      USDCHolding: usdc?.holding ?? 0,
      unsettlementPnL: unsettledPnL(positions),
    });
  }, [usdc]);

  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: freeCollateral.toDecimalPlaces(dp).toNumber(),
    totalValue: totalValue.toDecimalPlaces(dp).toNumber(),
    availableBalance,
  };
};
