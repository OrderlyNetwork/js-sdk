import { RefferalAPI as API } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";

export type AsAnAffiliateReturns = {
  isAffiliate: boolean;
  isLoading: boolean;
  referralInfo?: API.ReferralInfo;
  onEnterAffiliatePage?: (params?: any) => void;
  becomeAnAffiliate?: () => void;
};

export const useAsAnAffiliateScript = (): AsAnAffiliateReturns => {
  const {
    isAffiliate,
    isLoading,
    referralInfo,
    onEnterAffiliatePage,
    becomeAnAffiliateUrl,
  } = useReferralContext();

  const becomeAnAffiliate = () => {
    window.open(becomeAnAffiliateUrl, "_blank");

  };

  return {
    isAffiliate,
    isLoading,
    referralInfo,
    // isAffiliate: true,
    // isLoading: false,
    // referralInfo: MockData.referralInfo,
    onEnterAffiliatePage,
    becomeAnAffiliate,
  };
};
