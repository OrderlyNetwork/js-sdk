import { CurrentEpochEstimate } from "@kodiak-finance/orderly-hooks";
import { useTradingRewardsContext } from "../provider";
import { ENVType, useGetEnv } from "@kodiak-finance/orderly-hooks";
import { useDataTap } from "@kodiak-finance/orderly-react-app";
import { Decimal } from "@kodiak-finance/orderly-utils";
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