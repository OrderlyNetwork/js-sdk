import { useState } from "react";
import { TabPane, Tabs } from "@/tab";
import AssetHistory from "./assetHistory";
import FundingFee from "./fundingFee";
import Liquidations from "./liquidations";

export enum EPortfolioTab {
  DepositsWithdrawals = "deposits_withdrawals",
  Funding = "funding",
  Liquidations = "liquidations",
}

export const DataList = () => {
  const [activeTab, setActiveTab] = useState<string>(
    EPortfolioTab.Liquidations
  );

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      tabBarClassName="orderly-text-sm orderly-h-[48px] orderly-pl-0"
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
  );
};
