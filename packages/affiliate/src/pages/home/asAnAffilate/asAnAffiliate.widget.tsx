import { useAsAnAffiliateScript } from "./asAnAffiliate.script";
import { AsAnAffiliate } from "./asAnAffiliate.ui";

export const AsAnAffiliateWidget = () => {
  const state = useAsAnAffiliateScript();
  return <AsAnAffiliate {...state} />;
};
