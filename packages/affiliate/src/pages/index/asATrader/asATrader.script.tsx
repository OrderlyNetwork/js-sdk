import { RefferalAPI as API } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";

export type AsATraderReturns = {
    isTrader: boolean;
    isLoading: boolean;
    referralInfo?: API.ReferralInfo;
};

export const useAsATraderScript = (): AsATraderReturns => {

    const { isTrader, isLoading, referralInfo } = useReferralContext();

  return {
    // isTrader,
    // isLoading,
    // referralInfo,
    isTrader: true,
    isLoading: false,
    referralInfo: MockData.referralInfo,
  };
};
