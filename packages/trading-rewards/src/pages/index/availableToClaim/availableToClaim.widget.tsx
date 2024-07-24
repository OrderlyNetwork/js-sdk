import { useAvailableScript } from "./availableToClaim.script";
import { AvailableToClaim } from "./availableToClaim.ui";

export const AvailableToClaimWidget = () => {
    const state = useAvailableScript();
    return <AvailableToClaim {...state}/>
};