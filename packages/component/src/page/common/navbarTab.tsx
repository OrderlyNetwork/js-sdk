import React, { useMemo } from "react";

export type NavbarTabProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: {
    title: string;
    value: string;
  }[];
};

const NavbarTab: React.FC<NavbarTabProps> = (props) => {
  const tabs = useMemo(
    () => [
      {
        title: "Trade",
        value: "trade",
      },
      {
        title: "Portfolio",
        value: "portfolio",
      },
    ],
    []
  );
  return (
    <div className="orderly-flex orderly-items-center orderly-h-[48px] orderly-gap-x-[40px] orderly-ml-[60px]">
      {tabs.map((tab) => {
        return (
          <div
            key={tab.value}
            className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-98"
          >
            {tab.title}
          </div>
        );
      })}
    </div>
  );
};

export default NavbarTab;
