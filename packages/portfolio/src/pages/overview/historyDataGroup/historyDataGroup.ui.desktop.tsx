import React, { useEffect } from "react";
import { useAccount } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { AssetHistorySideEnum } from "@veltodefi/types";
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
} from "@veltodefi/ui";
import type { TabName } from "./historyDataGroup.script";

const LazyAssetHistoryWidget = React.lazy(() =>
  import("../assetHistory").then((mod) => {
    return { default: mod.AssetHistoryWidget };
  }),
);

const LazyFundingHistoryWidget = React.lazy(() =>
  import("../funding").then((mod) => {
    return { default: mod.FundingHistoryWidget };
  }),
);

const LazyDistributionHistoryWidget = React.lazy(() =>
  import("../distribution").then((mod) => {
    return { default: mod.DistributionHistoryWidget };
  }),
);

const LazyTransferHistoryWidget = React.lazy(() =>
  import("../TransferHistory").then((mod) => {
    return { default: mod.TransferHistoryWidget };
  }),
);

const LazyVaultsHistoryWidget = React.lazy(() =>
  import("../VaultsHistory").then((mod) => {
    return { default: mod.VaultsHistoryWidget };
  }),
);

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
          <React.Suspense fallback={null}>
            <LazyAssetHistoryWidget side={AssetHistorySideEnum.DEPOSIT} />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          title={t("common.withdrawals")}
          icon={<ArrowUpSquareFillIcon />}
          value={"withdraw"}
        >
          <React.Suspense fallback={null}>
            <LazyAssetHistoryWidget side={AssetHistorySideEnum.WITHDRAW} />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          title={t("common.funding")}
          icon={<FeeTierIcon />}
          value={"funding"}
        >
          <React.Suspense fallback={null}>
            <LazyFundingHistoryWidget />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.distribution")}
          icon={<ServerFillIcon />}
          value={"distribution"}
        >
          <React.Suspense fallback={null}>
            <LazyDistributionHistoryWidget />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          title={t("portfolio.overview.transferHistory")}
          icon={<ArrowLeftRightSquareFill />}
          value={"transfer"}
        >
          <React.Suspense fallback={null}>
            <LazyTransferHistoryWidget />
          </React.Suspense>
        </TabPanel>
        {isMainAccount && (
          <TabPanel
            value={"vaults"}
            icon={<VaultsIcon />}
            title={t("portfolio.overview.vaults")}
          >
            <React.Suspense fallback={null}>
              <LazyVaultsHistoryWidget />
            </React.Suspense>
          </TabPanel>
        )}
      </Tabs>
    </Card>
  );
};
