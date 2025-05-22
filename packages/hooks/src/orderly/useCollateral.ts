import { type API } from "@orderly.network/types";
import { useAppStore } from "./appStore";

export type CollateralOutputs = {
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number | null;
  availableBalance: number;
  unsettledPnL: number;
  // positions: API.Position[];
  accountInfo?: API.AccountInfo;
  holding?: API.Holding[];
};

// const positionsPath = pathOr([], [0, "rows"]);
// const totalCollateralPath = pathOr(0, [0, "totalCollateral"]);

export const useCollateral = (
  options: {
    /** decimal precision */
    dp: number;
  } = { dp: 6 },
): CollateralOutputs => {
  const { dp } = options;
  const {
    totalCollateral,
    totalValue,
    freeCollateral,
    availableBalance,
    unsettledPnL,
    holding,
  } = useAppStore((state) => state.portfolio);
  const accountInfo = useAppStore((state) => state.accountInfo);
  return {
    totalCollateral: totalCollateral.toDecimalPlaces(dp).toNumber(),
    freeCollateral: freeCollateral.toDecimalPlaces(dp).toNumber(),
    totalValue: totalValue?.toDecimalPlaces(dp).toNumber() ?? null,
    availableBalance,
    unsettledPnL,

    accountInfo,
    holding,

    // @hidden
    // positions: positionsPath(positions),
  };
};
