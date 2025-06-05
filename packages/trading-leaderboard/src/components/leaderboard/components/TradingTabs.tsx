import { TabPanel, Tabs } from "@orderly.network/ui";

export const TradingTabs = () => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      variant="contained"
      size="lg"
      classNames={{
        tabsList: "oui-px-0",
        tabsContent: "oui-pt-5",
      }}
    >
      <TabPanel title={"Trading volume"} value="deposit"></TabPanel>
      <TabPanel title={"Realized PnL"} value="withdraw"></TabPanel>
    </Tabs>
  );
};
