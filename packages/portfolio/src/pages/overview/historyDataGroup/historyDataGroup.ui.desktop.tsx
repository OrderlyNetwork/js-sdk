import React, { useEffect } from "react";
import { useAccount } from "@orderly.network/hooks";
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
  VaultsIcon,
} from "@orderly.network/ui";
import { TransferHistoryWidget } from "../TransferHistory";
import { VaultsHistoryWidget } from "../VaultsHistory";
import { AssetHistoryWidget } from "../assetHistory";
import { DistributionHistoryWidget } from "../distribution";
import { FundingHistoryWidget } from "../funding";
import type { TabName } from "./historyDataGroup.script";

export const HistoryDataGroupDesktop: React.FC<{
  active?: TabName;
  onTabChange: (tab: string) => void;
}> = (props) => {
  const { active = "deposit", onTabChange } = props;
  const { t } = useTranslation();
  const { isMainAccount } = useAccount();
  useEffect(() => {
    if (active === "vaults" && !isMainAccount) {
      onTabChange("deposit");
    }
  }, [active, isMainAccount]);
  return (
    <Card>
      <Tabs
        value={active}
        onValueChange={onTabChange}
        variant="contained"
        size="xl"
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
        {isMainAccount && (
          <TabPanel
            value={"vaults"}
            icon={<VaultsIcon />}
            title={t("portfolio.overview.vaults")}
          >
            <VaultsHistoryWidget />
          </TabPanel>
        )}
      </Tabs>
    </Card>
  );
};
