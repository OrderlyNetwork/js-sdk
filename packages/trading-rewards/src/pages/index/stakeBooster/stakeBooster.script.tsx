import { CurrentEpochEstimate } from "@veltodefi/hooks";
import { useTradingRewardsContext } from "../provider";
import { ENVType, useGetEnv } from "@veltodefi/hooks";
import { useDataTap } from "@veltodefi/react-app";
import { Decimal } from "@veltodefi/utils";
import { useMemo } from "react";

export const useStakeBoosterScript = () => {
  const { curEpochEstimate } = useTradingRewardsContext();

  const env = useGetEnv();
  const stakeNow = (e: any) => {
    const url = `https://${
      env !== ENVType.prod ? `${env}-` : ""
    }app.orderly.network/staking`;
    window.open(url, "_blank");
  };
  const estimateValue = useDataTap(curEpochEstimate);

  const booster = useMemo(() => {
    const estStakeBoost = curEpochEstimate?.est_stake_boost;
    if (typeof estStakeBoost === "undefined" || estStakeBoost === null) {
      return undefined;
    }

    if (estStakeBoost === 0) return estStakeBoost;

    return new Decimal(estStakeBoost)
      .div(new Decimal(10).pow(0.15))
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toString();
  }, [curEpochEstimate?.est_stake_boost]);
  return {
    curEpochEstimate: estimateValue ?? undefined,
    stakeNow,
    booster,
  };
};


export type StakeBoosterReturns = ReturnType<typeof useStakeBoosterScript>;