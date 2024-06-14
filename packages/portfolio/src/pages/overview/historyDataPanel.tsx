import { Card, TabPanel, Tabs } from "@orderly.network/ui";
import { AssetHistory } from "./assetHistory";
import { ArrowLeftRightIcon } from "@orderly.network/ui";

export const HistoryDataPanel = () => {
  return (
    <Card>
      <Tabs value={"deposit"}>
        <TabPanel
          title={"Deposits & Withdrawals"}
          icon={<ArrowLeftRightIcon />}
          value={"deposit"}
        >
          <AssetHistory />
        </TabPanel>
        <TabPanel
          title={"Funding"}
          icon={<ArrowLeftRightIcon />}
          value={"funding"}
        >
          <AssetHistory />
        </TabPanel>
      </Tabs>
    </Card>
  );
};
