import { useWalletRewardsHistory } from "@orderly.network/hooks";
import { useTradingRewardsContext } from "../provider";
import { useMemo } from "react";

export type AvailableReturns = {
  order?: number;
  esorder?: number;
  goToClaim?: (e: any) => void;
};

export const useAvailableScript = (): AvailableReturns => {
  const { type, totalOrderClaimedReward } = useTradingRewardsContext();
  const { data: totalClaimedReward } = totalOrderClaimedReward;

  const { data } = useWalletRewardsHistory(type);
  const totalGetReward = data?.wallet_lifetime_trading_rewards_order;

  const goToClaim = (e: any) => {};

  const availableOrder = useMemo(() => {
    if (
      typeof totalClaimedReward !== "undefined" &&
      typeof totalGetReward !== "undefined"
    ) {
      return totalGetReward - totalClaimedReward;
    }

    return undefined;
  }, [totalGetReward, totalClaimedReward]);

  const order = availableOrder;
  const esorder = 0;
  return {
    order,
    esorder,
    goToClaim,
  };
};
