import { useMemo } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import {
  pathOr_unsettledPnLPathOr,
  usePositionStream,
} from "./usePositionStream/usePositionStream";
import { pathOr } from "ramda";
import { account } from "@orderly.network/perp";
import { type API } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { zero } from "@orderly.network/utils";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useHoldingStream } from "./useHoldingStream";
import { useAppStore } from "./appStore";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number | null;
  availableBalance: number;
  unsettledPnL: number;

  // positions: API.Position[];
  accountInfo?: API.AccountInfo;
};

// const positionsPath = pathOr([], [0, "rows"]);
// const totalCollateralPath = pathOr(0, [0, "totalCollateral"]);

export const useCollateral = (
  options: {
    /** decimal precision */
    dp: number;
  } = { dp: 6 }
): CollateralOutputs => {
  const { dp } = options;
  const {
    totalCollateral,
    totalValue,
    freeCollateral,
    availableBalance,
    unsettledPnL,
  } = useAppStore((state) => state.portfolio);
  const accountInfo = useAppStore((state) => state.accountInfo);

  // const positions = usePositionStream(undefined, {
  //   includedPendingOrder: true,
  // });

  // console.log("positions", positions);

  // const [orders] = useOrderStream({ status: OrderStatus.NEW });

  // const { data: accountInfo } =
  //   usePrivateQuery<API.AccountInfo>("/v1/client/info");

  // const symbolInfo = useSymbolsInfo();

  // const { data: markPrices } = useMarkPricesStream();

  // const { usdc } = useHoldingStream();

  // const filterAlgoOrders =
  //   orders?.filter((item) => item.algo_order_id === undefined) ?? [];

  // const { data: holding } = usePrivateQuery<API.Holding[]>(
  //   "/v1/client/holding",
  //   {
  //     formatter: (data) => {
  //       return data.holding;
  //     },
  //   }
  // );

  // const [totalCollateral, totalValue] = useMemo(() => {
  //   return [
  //     pathOr(zero, [0, "totalCollateral"], positions),
  //     pathOr(zero, [0, "totalValue"], positions),
  //   ];
  // }, [positions, markPrices]);

  // const totalInitialMarginWithOrders = useMemo(() => {
  //   if (!accountInfo || !symbolInfo || !markPrices) {
  //     return 0;
  //   }
  //
  //   return account.totalInitialMarginWithQty({
  //     positions: positionsPath(positions),
  //     markPrices,
  //     IMR_Factors: accountInfo.imr_factor,
  //     maxLeverage: accountInfo.max_leverage,
  //     symbolInfo,
  //   });
  // }, [
  //   positions,
  //   // filterAlgoOrders,
  //   markPrices,
  //   accountInfo,
  //   symbolInfo,
  // ]);
  //
  // const freeCollateral = useMemo(() => {
  //   return account.freeCollateral({
  //     totalCollateral,
  //     totalInitialMarginWithOrders,
  //   });
  // }, [totalCollateral, totalInitialMarginWithOrders]);
  //
  // const availableBalance = useMemo(() => {
  //   return account.availableBalance({
  //     USDCHolding: usdc?.holding ?? 0,
  //     unsettlementPnL: pathOr_unsettledPnLPathOr(positions),
  //   });
  // }, [usdc?.holding, pathOr_unsettledPnLPathOr(positions)]);

  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: freeCollateral.toDecimalPlaces(dp).toNumber(),
    totalValue: totalValue?.toDecimalPlaces(dp).toNumber() ?? null,
    availableBalance,
    unsettledPnL,

    accountInfo,

    // @hidden
    // positions: positionsPath(positions),
  };
};
