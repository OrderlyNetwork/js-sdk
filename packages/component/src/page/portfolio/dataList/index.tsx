import { useState } from "react";
import { TabPane, Tabs } from "@/tab";
import AssetHistory from "./assetHistory";

export enum EPortfolioTab {
  DepositsWithdrawals = "deposits_withdrawals",
  Funding = "funding",
  Liquidations = "liquidations",
}

export const DataList = () => {
  const [activeTab, setActiveTab] = useState<string>(
    EPortfolioTab.DepositsWithdrawals
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
        <></>
      </TabPane>
      <TabPane title="Liquidations" value={EPortfolioTab.Liquidations}>
        <></>
      </TabPane>
    </Tabs>
  );
};
