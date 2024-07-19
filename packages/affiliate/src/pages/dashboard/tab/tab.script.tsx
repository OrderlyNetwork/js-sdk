import { ReactNode, useEffect, useMemo, useState } from "react";
import { useReferralContext } from "../../../hooks";

export type TabReturns = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<TabTypes>>;
  isAffiliate: boolean;
  isTrader: boolean;
  isLoading: boolean;
  anAnAffiliate: () => void;
  anATrader: () => void;
  splashPage?: () => ReactNode | undefined;
};

export enum TabTypes {
  affiliate = "affiliate",
  trader = "trader",
}

export const useTabScript = (): TabReturns => {
  const {
    isAffiliate,
    isTrader,
    isLoading,
    becomeAnAffiliateUrl,
    onBecomeAnAffiliate,
    showReferralPage,
    splashPage
    
  } = useReferralContext();
  const [tab, setTab] = useState<TabTypes>(TabTypes.trader);
  const [showHome, setShowHome] = useState(isLoading);

  useEffect(() => {
    setShowHome(true);
  }, [isLoading]);

  const tableValue = useMemo((): TabTypes => {
    if (isAffiliate && isTrader) {
      return tab;
    } else if (isAffiliate && !isTrader) {
      return TabTypes.affiliate;
    } else if (!isAffiliate && isTrader) {
      return TabTypes.trader;
    } else {
      return TabTypes.affiliate;
    }
  }, [tab, isAffiliate, isTrader]);

  const anAnAffiliate = () => {
    if (becomeAnAffiliateUrl !== undefined) {
      window.open(becomeAnAffiliateUrl, "_blank");
    } else if (onBecomeAnAffiliate !== undefined) {
      onBecomeAnAffiliate?.();
    }
  };

  const anATrader = () => {
    showReferralPage?.();
  };

  return {
    setTab,
    // tab: tableValue,
    // isAffiliate,
    // isTrader,
    // isLoading,
    anAnAffiliate,
    anATrader,
    splashPage,
    tab: TabTypes.trader,
    isAffiliate: false,
    isTrader: true,
    isLoading: false,
  };
};
