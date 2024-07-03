import { useStakeBoosterScript } from "./stakeBooster.script";
import { StakeBoosterUI } from "./stakeBooster.ui";

export const StakeBoosterWidget = () => {
    const state = useStakeBoosterScript();
    return <StakeBoosterUI {...state} />
};