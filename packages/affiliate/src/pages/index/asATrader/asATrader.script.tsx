import { RefferalAPI as API, useAccount } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";
import { AccountStatusEnum } from "@orderly.network/types";

export type AsATraderReturns = {
  isTrader: boolean;
  isLoading: boolean;
  referralInfo?: API.ReferralInfo;
  onEnterTraderPage?: (params?: any) => void;
  bindReferralCodeState?: (
    success: boolean,
    error: any,
    hide: any,
    queryParams: any
  ) => void;
  isSignIn: boolean;
};

export const useAsATraderScript = (): AsATraderReturns => {
  const {
    isTrader,
    isLoading,
    referralInfo,
    onEnterTraderPage,
    bindReferralCodeState,
  } = useReferralContext();

  const { state } = useAccount();
  const isSignIn = state.status === AccountStatusEnum.EnableTrading;

  return {
    isSignIn,
    isTrader,
    isLoading,
    referralInfo,
    // isTrader: true,
    // isLoading: false,
    // referralInfo: MockData.referralInfo,
    onEnterTraderPage,
    bindReferralCodeState,
  };
};
