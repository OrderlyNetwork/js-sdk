import { useAsAnAffiliateScript } from "./asAnAffiliate.script";
import { AsAnAffiliateUI } from "./asAnAffiliate.ui";

export const AsAnAffiliateWidget = () => {
    const state = useAsAnAffiliateScript();
    return (
        <AsAnAffiliateUI {...state}/>
    );
};
