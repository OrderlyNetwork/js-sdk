import { useBecomeAffiliateScript } from "./becomeAffiliate.script";
import { BecomeAffiliateUI } from "./becomeAffiliate.ui";

export const BecomeAffiliateWidget = () => {
    const state = useBecomeAffiliateScript();
    return (
        <BecomeAffiliateUI {...state}/>
    );
};
