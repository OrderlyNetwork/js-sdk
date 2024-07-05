import { useCommissionAndRefereesScript } from "./commissionAndReferees.script";
import { CommissionAndRefereesUI } from "./commissionAndReferees.ui";

export const CommissionAndRefereesWidget = () => {
    const state = useCommissionAndRefereesScript();
    return (
        <CommissionAndRefereesUI {...state}/>
    );
};
