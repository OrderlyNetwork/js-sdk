import { useAppContext } from "@veltodefi/react-app";
import { useScreen } from "@veltodefi/ui";
import { TabTypes, useReferralContext } from "../../../provider";

export type AsAnAffiliateReturns = ReturnType<typeof useAsAnAffiliateScript>;

export const useAsAnAffiliateScript = () => {
  const {
    isAffiliate,
    isLoading,
    referralInfo,
    becomeAnAffiliateUrl,
    setShowHome,
    setTab,
  } = useReferralContext();

  const { wrongNetwork } = useAppContext();

  const becomeAnAffiliate = () => {
    window.open(becomeAnAffiliateUrl, "_blank");
  };

  const onEnterAffiliatePage = () => {
    setTab(TabTypes.affiliate);
    setShowHome(false);
  };

  const { isMobile } = useScreen();

  return {
    isAffiliate,
    isLoading,
    referralInfo,
    onEnterAffiliatePage,
    becomeAnAffiliate,
    wrongNetwork,
    isMobile,
  };
};
