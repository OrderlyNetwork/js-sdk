import { useStakeBoosterScript } from "./stakeBooster.script";
import { StakeBooster } from "./stakeBooster.ui";

export const StakeBoosterWidget = () => {
    const state = useStakeBoosterScript();
    return <StakeBooster {...state} />
};