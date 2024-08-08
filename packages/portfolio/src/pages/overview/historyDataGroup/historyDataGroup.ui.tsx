import {
  Card,
  FeeTierIcon,
  ServerFillIcon,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { ArrowLeftRightIcon } from "@orderly.network/ui";
import { AssetHistory, AssetHistoryWidget } from "../assetHistory";
import { TabName } from "./useState.script";
import { FundingHistoryWidget } from "../funding";
import { DistributionHistoryWidget } from "../distribution";

export const HistoryDataGroupUI = (props: {
  active?: TabName;
  onTabChange: (tab: string) => void;
}) => {
  const { active = "deposit", onTabChange } = props;
  return (
    <Card>
      <Tabs
        value={active}
        onValueChange={onTabChange}
        variant="contained"
        size="xl"
        classNames={{
          tabsList: "oui-px-3",
        }}
      >
        <TabPanel
          title={"Deposits & Withdrawals"}
          icon={<ArrowLeftRightIcon />}
          value={"deposit"}
        >
          <AssetHistoryWidget />
        </TabPanel>
        <TabPanel title={"Funding"} icon={<FeeTierIcon />} value={"funding"}>
          <FundingHistoryWidget />
        </TabPanel>
        <TabPanel
          title={"Distribution"}
          icon={<ServerFillIcon />}
          value={"distribution"}
        >
          <DistributionHistoryWidget />
        </TabPanel>
      </Tabs>
    </Card>
  );
};
