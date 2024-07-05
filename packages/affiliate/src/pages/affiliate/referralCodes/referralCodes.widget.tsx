import { useReferralCodesScript } from "./referralCodes.script";
import { ReferralCodesUI } from "./referralCodes.ui";

export const ReferralCodesWidget = () => {
    const state = useReferralCodesScript();
    return (
        <ReferralCodesUI {...state}/>
    );
};
