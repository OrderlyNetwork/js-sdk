import { useReferralLinkScript } from "./referralLink.script";
import { ReferralLinkUI } from "./referralLink.ui";

export const ReferralLinkWidget = () => {
    const state = useReferralLinkScript();
    return (
        <ReferralLinkUI {...state}/>
    );
};
