import { useTranslation } from "@orderly.network/i18n";
import { AssetHistorySideEnum } from "@orderly.network/types";
import {
  ArrowDownSquareFillIcon,
  ArrowLeftRightSquareFill,
  ArrowUpSquareFillIcon,
  Card,
  FeeTierIcon,
  ServerFillIcon,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { TransferHistoryWidget } from "../TransferHistory";
import { AssetHistoryWidget } from "../assetHistory";
import { DistributionHistoryWidget } from "../distribution";
import { FundingHistoryWidget } from "../funding";
import { TabName } from "./historyDataGroup.script";

export const HistoryDataGroupDesktop = (props: {
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
          title={t("common.deposits")}
          icon={<ArrowDownSquareFillIcon />}
          value={"deposit"}
        >
          <AssetHistoryWidget side={AssetHistorySideEnum.DEPOSIT} />
        </TabPanel>
        <TabPanel
          title={t("common.withdrawals")}
          icon={<ArrowUpSquareFillIcon />}
          value={"withdraw"}
        >
          <AssetHistoryWidget side={AssetHistorySideEnum.WITHDRAW} />
        </TabPanel>
        <TabPanel
          title={t("common.funding")}
          icon={<FeeTierIcon />}
          value={"funding"}
        >
          <FundingHistoryWidget />
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.distribution")}
          icon={<ServerFillIcon />}
          value={"distribution"}
        >
          <DistributionHistoryWidget />
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.transferHistory")}
          icon={<ArrowLeftRightSquareFill />}
          value={"transfer"}
        >
          <TransferHistoryWidget />
        </TabPanel>
      </Tabs>
    </Card>
  );
};
