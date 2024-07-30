import { RefferalAPI as API, useAccount } from "@orderly.network/hooks";
import { TabTypes, useReferralContext } from "../../../hooks";
import { MockData } from "../../../utils/mockData";
import { AccountStatusEnum } from "@orderly.network/types";

export type AsTraderReturns = {
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

export const useAsTraderScript = (): AsTraderReturns => {
  const {
    isTrader,
    isLoading,
    referralInfo,
    setShowHome,
    bindReferralCodeState,
    setTab,
    mutate,
  } = useReferralContext();

  const { state } = useAccount();
  const isSignIn = state.status === AccountStatusEnum.EnableTrading;
  const onEnterTraderPage = () => {
    setTab(TabTypes.trader);
    setShowHome(false);
  };

  const bindSuccess = (
    success: boolean,
    error: any,
    hide: any,
    queryParams: any
  ) => {
    mutate();
    bindReferralCodeState?.(success, error, hide, queryParams);
  }
  return {
    isSignIn,
    isTrader,
    isLoading,
    referralInfo,
    // isTrader: true,
    // isLoading: false,
    // referralInfo: MockData.referralInfo,
    onEnterTraderPage,
    bindReferralCodeState: bindSuccess,
  };
};
