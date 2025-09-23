import { ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { TabTypes, useReferralContext } from "../../../hooks";

export type TabReturns = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<TabTypes>>;
  isAffiliate: boolean;
  isTrader: boolean;
  isLoading: boolean;
  anAnAffiliate: () => void;
  anATrader: () => void;
  splashPage?: () => ReactNode | undefined;
  showHome: boolean;
  setShowHome: (value: boolean) => void;
};

export const useTabScript = (): TabReturns => {
  const {
    isAffiliate,
    isTrader,
    isLoading,
    splashPage,
    showHome,
    setShowHome,
    tab,
    setTab,
  } = useReferralContext();

  const [storedTab, setStoredTab] = useLocalStorage<TabTypes>(
    "orderly_affiliate_dashboard_tab",
    TabTypes.affiliate,
  );

  const resolveInitialTab = (): TabTypes => {
    const qp =
      typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get(
            "tab",
          ) as TabTypes | null)
        : null;
    const candidate =
      (qp as TabTypes) || (storedTab as TabTypes) || (tab as TabTypes);
    if (isAffiliate && isTrader) {
      return candidate || TabTypes.affiliate;
    } else if (isAffiliate && !isTrader) {
      return TabTypes.affiliate;
    } else if (!isAffiliate && isTrader) {
      return TabTypes.trader;
    } else {
      return TabTypes.affiliate;
    }
  };

  const [uiTab, setUiTab] = useState<TabTypes>(resolveInitialTab());

  useEffect(() => {
    if (isLoading) return;
    const next = resolveInitialTab();
    const qp =
      typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get(
            "tab",
          ) as TabTypes | null)
        : null;

    if (next !== uiTab) {
      setUiTab(next);
      setTab(next);
    }
    if (qp || storedTab !== next) {
      setStoredTab(next);
    }
  }, [isAffiliate, isTrader, isLoading, storedTab]);

  const handleSetTab: React.Dispatch<React.SetStateAction<TabTypes>> = (
    value,
  ) => {
    // update UI first to avoid flicker, then sync context/storage
    setUiTab(
      typeof value === "function"
        ? (value as (prev: TabTypes) => TabTypes)(uiTab)
        : (value as TabTypes),
    );
    setTab(value);
    const finalValue =
      typeof value === "function"
        ? (value as (prev: TabTypes) => TabTypes)(uiTab)
        : (value as TabTypes);
    setStoredTab(finalValue);
  };

  const anAnAffiliate = () => {
    // if (becomeAnAffiliateUrl !== undefined) {
    //   window.open(becomeAnAffiliateUrl, "_blank");
    // } else if (onBecomeAnAffiliate !== undefined) {
    //   onBecomeAnAffiliate?.();
    // }
    setShowHome(true);
  };

  const anATrader = () => {
    setShowHome(true);
    // showReferralPage?.();
  };

  return {
    setTab: handleSetTab,
    tab: uiTab,
    isAffiliate,
    isTrader,
    isLoading,
    anAnAffiliate,
    anATrader,
    splashPage,
    showHome,
    setShowHome,
    // tab: TabTypes.affiliate,
    // isAffiliate: false,
    // isTrader: false,
    // isLoading: false,
  };
};
