import { useMemo } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import {
  pathOr_unsettledPnLPathOr,
  usePositionStream,
} from "./usePositionStream";
import { pathOr } from "ramda";
import { account } from "@orderly.network/futures";
import { type API, OrderStatus } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { zero } from "@orderly.network/utils";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useHoldingStream } from "./useHoldingStream";
import { useOrderStream } from "./useOrderStream";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number;
  availableBalance: number;
  unsettledPnL: number;
};

const positionsPath = pathOr([], [0, "rows"]);
const totalCollateralPath = pathOr(0, [0, "totalCollateral"]);

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

  const [orders] = useOrderStream({ status: OrderStatus.NEW });

  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/v1/client/info");

  const symbolInfo = useSymbolsInfo();

  const { data: markPrices } = useMarkPricesStream();

  const { usdc } = useHoldingStream();

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
      unsettlementPnL: pathOr_unsettledPnLPathOr(positions),
    });
  }, [usdc, pathOr_unsettledPnLPathOr(positions)]);

  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: freeCollateral.toDecimalPlaces(dp).toNumber(),
    totalValue: totalValue.toDecimalPlaces(dp).toNumber(),
    availableBalance,
    unsettledPnL: pathOr_unsettledPnLPathOr(positions),
  };
};
