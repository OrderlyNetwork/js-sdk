import {
  useAccount,
  useCollateral,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { useCallback, useMemo } from "react";
import { toast } from "@orderly.network/ui";

export const usePortfolioSheetScript = () => {
  const { account } = useAccount();
  const assets = useAssets();
  const marginRatio = useMarginRatioAndLeverage();
  const onSettlePnL = useCallback(async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code == -1104) {
          toast.error(
            "Settlement is only allowed once every 10 minutes. Please try again later."
          );
          return Promise.reject(e);
        }
        if (e?.code === "ACTION_REJECTED") {
          toast.error("User rejected the request.");
          return Promise.reject(e);
        }
      })
      .then((res) => {
        toast.success("Settlement requested");
        return Promise.resolve(res);
      });
  }, [account]);
  return {
    ...assets,
    ...marginRatio,
    onSettlePnL,
  };
};

const useAssets = () => {
  const { hideAssets, setHideAssets } = useTradingLocalStorage();
  const toggleHideAssets = () => {
    setHideAssets(!hideAssets);
  };
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });
  return {
    hideAssets,
    toggleHideAssets,
    totalCollateral,
    freeCollateral,
    totalValue,
    availableBalance,
  };
};

const useMarginRatioAndLeverage = () => {
  const [{ aggregated, totalUnrealizedROI }, positionsInfo] =
    usePositionStream();
  const { marginRatio, currentLeverage, mmr } = useMarginRatio();

  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? // @ts-ignore
          positionsInfo["margin_ratio"](10)
        : marginRatio
    );
  }, [marginRatio, aggregated]);

  return {
    aggregated,
    totalUnrealizedROI,
    positionsInfo,
    marginRatio,
    currentLeverage,
    mmr,
  };
};

export type PortfolioSheetState = ReturnType<typeof usePortfolioSheetScript>;
