import { useContext, useState } from "react";
import { TabPane, Tabs } from "@/tab";
import AssetHistory from "./assetHistory";
import FundingFee from "./fundingFee";
import Liquidations from "./liquidations";
import { LayoutContext } from "@/layout/layoutContext";

export enum EPortfolioTab {
  DepositsWithdrawals = "deposits_withdrawals",
  Funding = "funding",
  Liquidations = "liquidations",
}

export const DataList = () => {
  const [activeTab, setActiveTab] = useState<string>(
    EPortfolioTab.DepositsWithdrawals
  );

  const { pageHeaderHeight, headerHeight, footerHeight } =
    useContext(LayoutContext);

  const height = `calc(100vh - ${
    headerHeight + footerHeight + (pageHeaderHeight ?? 0) + 40
  }px)`;

  return (
    <div style={{ height }} className="orderly-overflow-hidden">
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
