import {
  Card,
  FeeTierIcon,
  ServerFillIcon,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { ArrowLeftRightIcon } from "@orderly.network/ui";
import { AssetHistoryWidget } from "../assetHistory";
import { TabName } from "./useState.script";
import { FundingHistoryWidget } from "../funding";
import { DistributionHistoryWidget } from "../distribution";
import { useTranslation } from "@orderly.network/i18n";
export const HistoryDataGroupUI = (props: {
  active?: TabName;
  onTabChange: (tab: string) => void;
}) => {
  const { active = "deposit", onTabChange } = props;
  const { t } = useTranslation();

  return (
    <Card>
      <Tabs
        value={active}
        onValueChange={onTabChange}
        variant="contained"
        size="xl"
        // classNames={{
        //   tabsList: "oui-px-3",
        // }}
      >
        <TabPanel
          title={t("portfolio.overview.dataList.tabs.assetHistory")}
          icon={<ArrowLeftRightIcon />}
          value={"deposit"}
        >
          <AssetHistoryWidget />
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.dataList.tabs.funding")}
          icon={<FeeTierIcon />}
          value={"funding"}
        >
          <FundingHistoryWidget />
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.dataList.tabs.distribution")}
          icon={<ServerFillIcon />}
          value={"distribution"}
        >
          <DistributionHistoryWidget />
        </TabPanel>
      </Tabs>
    </Card>
  );
};
