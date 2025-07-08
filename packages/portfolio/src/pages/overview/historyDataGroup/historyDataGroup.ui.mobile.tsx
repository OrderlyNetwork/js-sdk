import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { TabPanel, Tabs } from "@orderly.network/ui";
import { formatAddress } from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { ConvertHistoryWidget } from "../../assets/convert.widget";
import { AssetHistoryWidget } from "../assetHistory";
import { DistributionHistoryWidget } from "../distribution";
import { FundingHistoryWidget } from "../funding";
import { TabName } from "./useState.script";

enum AccountType {
  ALL = "All accounts",
  MAIN = "Main accounts",
}

export const HistoryDataGroupMobile = (props: {
  active?: TabName;
  onTabChange: (tab: string) => void;
}) => {
  const { active = "deposit", onTabChange } = props;
  const { t } = useTranslation();
  const { state } = useAccount();
  const subAccounts = state.subAccounts ?? [];

  const ALL_ACCOUNTS: SelectOption = {
    label: t("common.allAccounts", "All accounts"),
    value: AccountType.ALL,
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("common.mainAccount", "Main account"),
    value: AccountType.MAIN,
  };

  const memoizedOptions = useMemo(() => {
    if (Array.isArray(subAccounts) && subAccounts.length) {
      return [
        ALL_ACCOUNTS,
        MAIN_ACCOUNT,
        ...subAccounts.map<SelectOption>((value) => ({
          value: value.id,
          label: value?.description || formatAddress(value?.id),
        })),
      ];
    }
    return [ALL_ACCOUNTS, MAIN_ACCOUNT];
  }, [subAccounts]);

  return (
    <Tabs
      value={active}
      onValueChange={onTabChange}
      variant="contained"
      size="lg"
      classNames={{
        tabsList: "oui-px-3 oui-py-2",
        tabsListContainer: "oui-overflow-x-auto",
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
      <TabPanel
        title={t("portfolio.overview.tab.convert.history")}
        value={"convert"}
      >
        <ConvertHistoryWidget memoizedOptions={memoizedOptions} />
      </TabPanel>
    </Tabs>
  );
};
