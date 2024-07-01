import { useAvailableScript } from "./availableToClaim.script";
import { AvailableToClaimUI } from "./availableToClaim.ui";

export const AvailableToClaimWidget = () => {
    const state = useAvailableScript();
    return <AvailableToClaimUI {...state}/>
};