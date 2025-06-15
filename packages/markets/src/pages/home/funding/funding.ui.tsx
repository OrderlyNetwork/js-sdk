import type { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, TabPanel, Tabs } from "@orderly.network/ui";
import { FundingComparisonWidget } from "../../../components/fundingComparison";
import { FundingOverviewWidget } from "../../../components/fundingOverview";
import { SearchInput } from "../../../components/searchInput.tsx";
import { FundingScriptReturn } from "./funding.script";

export const Funding: FC<FundingScriptReturn> = (props) => {
  const { t } = useTranslation();

  return (
    <Box id="oui-funding-list" intensity={900} p={6} mt={4} r="2xl">
      <Tabs
        variant="contained"
        size="lg"
        value={props.activeTab}
        onValueChange={props.onTabChange as (value: string) => void}
        trailing={
          <SearchInput classNames={{ root: "oui-my-1 oui-w-[240px]" }} />
        }
      >
        <TabPanel
          title={t("common.overview")}
          value="overview"
          testid="oui-testid-funding-overview-tab"
        >
          <FundingOverviewWidget />
        </TabPanel>
        <TabPanel
          title={t("markets.funding.comparison")}
          value="comparison"
          testid="oui-testid-funding-comparison-tab"
        >
          <FundingComparisonWidget />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
