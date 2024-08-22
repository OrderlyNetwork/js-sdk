import { CurrentEpochEstimate } from "@orderly.network/hooks";
import { useTradingRewardsContext } from "../provider";
import { ENVType, useGetEnv } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";

export type StakeBoosterReturns = {
    curEpochEstimate?: CurrentEpochEstimate;
    stakeNow?: (e: any) => void;
};

export const useStakeBoosterScript = (): StakeBoosterReturns => {
    const { curEpochEstimate } = useTradingRewardsContext();

    const env = useGetEnv();
    const stakeNow = (e: any) => {
        const url = `https://${env !== ENVType.prod ? `${env}-` : ""}app.orderly.network/staking`;
        window.open(url, "_blank");
    };
    const estimateValue = useDataTap(curEpochEstimate);
    return {
        curEpochEstimate: estimateValue ?? undefined,
        stakeNow
    };
};