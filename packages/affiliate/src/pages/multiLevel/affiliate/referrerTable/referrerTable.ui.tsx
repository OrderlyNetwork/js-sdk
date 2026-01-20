import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Tabs, TabPanel, Flex } from "@orderly.network/ui";
import { CommissionTable } from "./commission";
import { RefereesTable } from "./referees";
import { ReferralCodesTable } from "./referralCodes";
import { ReferrerTableScriptReturns } from "./referrerTable.script";

export const ReferrerTableUI: FC<ReferrerTableScriptReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      className="oui-rounded-2xl oui-bg-base-9 [&_td]:oui-font-medium [&_td]:oui-tracking-[0.03em] [&_th]:oui-font-semibold"
      px={3}
      pt={4}
      gap={4}
      width="100%"
    >
      <Tabs
        value={props.activeTab}
        onValueChange={props.setActiveTab}
        className="oui-w-full oui-text-base"
        variant="text"
        classNames={{
          tabsListContainer: "oui-px-3",
          trigger: "oui-pb-[9px] oui-tracking-[0.01em]",
        }}
      >
        <TabPanel value="commission" title={t("affiliate.commission")}>
          <CommissionTable
            commissionData={props.commissionData}
            isLoading={props.isLoading}
            pagination={props.pagination}
            onSort={props.onSort}
            dateRange={props.dateRange}
            setDateRange={props.setDateRange}
          />
        </TabPanel>
        <TabPanel value="referees" title={t("affiliate.referees")}>
          <RefereesTable
            refereesData={props.refereesData}
            isRefereesLoading={props.isRefereesLoading}
            refereesPagination={props.refereesPagination}
            onEditReferee={props.onEditReferee}
          />
        </TabPanel>
        <TabPanel value="codes" title={t("affiliate.referralCodes")}>
          <ReferralCodesTable />
        </TabPanel>
      </Tabs>
    </Flex>
  );
};
