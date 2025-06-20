import { useTranslation } from "@orderly.network/i18n";
import { TabPanel, Tabs } from "@orderly.network/ui";
import { AssetHistoryWidget } from "../assetHistory";
import { DistributionHistoryWidget } from "../distribution";
import { FundingHistoryWidget } from "../funding";
import { TabName } from "./useState.script";

export const HistoryDataGroupMobile = (props: {
  active?: TabName;
  onTabChange: (tab: string) => void;
}) => {
  const { active = "deposit", onTabChange } = props;
  const { t } = useTranslation();

  return (
    <Tabs
      value={active}
      onValueChange={onTabChange}
      variant="contained"
      size="lg"
      classNames={{
        tabsList: "oui-px-3 oui-py-2",
      }}
    >
      <TabPanel title={t("common.deposits")} value={"deposit"}>
        <AssetHistoryWidget side="deposit" />
      </TabPanel>
      <TabPanel title={t("common.withdrawals")} value={"withdraw"}>
        <AssetHistoryWidget side="withdraw" />
      </TabPanel>
      <TabPanel title={t("common.funding")} value={"funding"}>
        <FundingHistoryWidget />
      </TabPanel>
      <TabPanel
        title={t("portfolio.overview.distribution")}
        value={"distribution"}
      >
        <DistributionHistoryWidget />
      </TabPanel>
    </Tabs>
  );
};
