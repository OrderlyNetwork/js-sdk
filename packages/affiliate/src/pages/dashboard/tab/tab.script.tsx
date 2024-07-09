import { useState } from "react";

export type TabReturns = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<TabTypes>>;
};

export enum TabTypes {
  affiliate = "affiliate",
  trader = "trader",
}

export const useTabScript = (): TabReturns => {
  const [tab, setTab] = useState<TabTypes>(TabTypes.affiliate);
  return {
    tab,
    setTab,
  };
};
