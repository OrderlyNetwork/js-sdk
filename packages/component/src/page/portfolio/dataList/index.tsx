import { useContext, useState } from "react";
import { LayoutContext } from "@/layout/layoutContext";
import { TabPane, Tabs } from "@/tab";
import AssetHistory from "./assetHistory";
import FundingFee from "./fundingFee";

export enum EPortfolioTab {
  DepositsWithdrawals = "deposits_withdrawals",
  Funding = "funding",
  Liquidations = "liquidations",
}

export const DataList = () => {
  const [activeTab, setActiveTab] = useState<string>(
    EPortfolioTab.DepositsWithdrawals,
  );

  const { pageHeaderHeight, headerHeight, footerHeight } =
    useContext(LayoutContext);

  const height = `calc(100vh - ${
    headerHeight + footerHeight + (pageHeaderHeight ?? 0) + 20 + 32
  }px)`;

  return (
    <div
      style={{ height }}
      className="orderly-overflow-hidden orderly-max-w-[1408px] orderly-min-w-[736px] orderly-mx-auto orderly-tabular-nums"
    >
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        tabBarClassName="orderly-h-[48px] orderly-text-sm orderly-pl-0"
      >
        <TabPane
          title="Deposits & Withdrawals"
          value={EPortfolioTab.DepositsWithdrawals}
        >
          <AssetHistory />
        </TabPane>
        <TabPane title="Funding" value={EPortfolioTab.Funding}>
          <FundingFee />
        </TabPane>
        {/* <TabPane title="Liquidations" value={EPortfolioTab.Liquidations}>
        <Liquidations />
      </TabPane> */}
      </Tabs>
    </div>
  );
};
