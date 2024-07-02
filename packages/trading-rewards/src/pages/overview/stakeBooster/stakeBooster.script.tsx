import { CurrentEpochEstimate } from "@orderly.network/hooks";
import { useTradingRewardsContext } from "../provider";
import { ENVType, useGetEnv } from "@orderly.network/hooks";

export type StakeBoosterReturns = {
    curEpochEstimate?: CurrentEpochEstimate;
    stakeNow?: (e: any) => void;
};

export const useStakeBoosterScript = (): StakeBoosterReturns => {
    const { curEpochEstimate } = useTradingRewardsContext();

    const env = useGetEnv();
    const stakeNow = (e: any) => {
        const url = `https://${env !== ENVType.prod ? `${env}-` : ""}app.orderly.network/stake`;
        window.open(url, "_blank");
    };
    return {
        curEpochEstimate,
        stakeNow
    };
};