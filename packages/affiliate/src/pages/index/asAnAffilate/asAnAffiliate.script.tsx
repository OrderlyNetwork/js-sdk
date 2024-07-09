import { RefferalAPI as API } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";

export type AsAnAffiliateReturns = {
  isAffiliate: boolean;
  isLoading: boolean;
  referralInfo?: API.ReferralInfo;
};

export const useAsAnAffiliateScript = (): AsAnAffiliateReturns => {
  const { isAffiliate, isLoading, referralInfo } = useReferralContext();

  return {
    // isAffiliate,
    // isLoading,
    // referralInfo,
    isAffiliate: true,
    isLoading: false,
    referralInfo: MockData.referralInfo,
  };
};
