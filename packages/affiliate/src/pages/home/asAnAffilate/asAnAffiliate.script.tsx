import { RefferalAPI as API, useAccount } from "@orderly.network/hooks";
import { TabTypes, useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";
import { AccountStatusEnum } from "@orderly.network/types";

export type AsAnAffiliateReturns = {
  isAffiliate: boolean;
  isLoading: boolean;
  referralInfo?: API.ReferralInfo;
  onEnterAffiliatePage?: (params?: any) => void;
  becomeAnAffiliate?: () => void;
  isSignIn: boolean;
};

export const useAsAnAffiliateScript = (): AsAnAffiliateReturns => {
  const {
    isAffiliate,
    isLoading,
    referralInfo,
    becomeAnAffiliateUrl,
    setShowHome,
    setTab,
  } = useReferralContext();

  const { state } = useAccount();
  const isSignIn = state.status === AccountStatusEnum.EnableTrading;

  const becomeAnAffiliate = () => {
    window.open(becomeAnAffiliateUrl, "_blank");
  };

  const onEnterAffiliatePage = () => {
    setTab(TabTypes.affiliate);
    setShowHome(false);
  };

  return {
    isSignIn,
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
