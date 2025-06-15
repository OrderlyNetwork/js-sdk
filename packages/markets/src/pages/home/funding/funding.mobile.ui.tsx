import type { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs } from "@orderly.network/ui";
import { FundingComparisonWidget } from "../../../components/fundingComparison";
import { FundingOverviewWidget } from "../../../components/fundingOverview";
import { SearchInput } from "../../../components/searchInput.tsx";
import { FundingScriptReturn } from "./funding.script";

export const MobileFunding: FC<FundingScriptReturn> = (props) => {
  const { t } = useTranslation();

  const search = (
    <SearchInput
      classNames={{
        root: cn("oui-mb-2 oui-mt-5"),
      }}
    />
  );

  return (
    <Box id="oui-funding-list" intensity={900} p={3} mt={2} mb={5} r="xl">
      <Tabs
        variant="contained"
        size="lg"
        value={props.activeTab}
        onValueChange={props.onTabChange as (value: string) => void}
      >
        <TabPanel
          title={t("common.overview")}
          value="overview"
          testid="oui-testid-funding-overview-tab"
        >
          <>
            {search}
            <FundingOverviewWidget />
          </>
        </TabPanel>
        <TabPanel
          title={t("markets.funding.comparison")}
          value="comparison"
          testid="oui-testid-funding-comparison-tab"
        >
          <>
            {search}
            <FundingComparisonWidget />
          </>
        </TabPanel>
      </Tabs>
    </Box>
  );
};
