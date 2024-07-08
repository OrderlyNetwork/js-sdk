import { useRebatesScript } from "./rebates.script";
import { RebatesUI } from "./rebates.ui";

export const RebatesWidget = () => {
    const state = useRebatesScript();
    return (
        <RebatesUI {...state}/>
    );
};
