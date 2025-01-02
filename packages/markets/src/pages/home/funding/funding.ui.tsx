import type { FC } from "react";
import { Box, TabPanel, Tabs } from "@orderly.network/ui";
import { FundingOverviewWidget } from "../../../components/fundingOverview";
import { FundingComparisonWidget } from "../../../components/fundingComparison";
import { UseFundingScript } from "./funding.script";

export type FundingUIProps = UseFundingScript;

export const FundingUI: FC<FundingUIProps> = ({
  activeFundingTab,
  onFundingTabChange,
}) => {
  return (
    <Box id="oui-funding-list" intensity={900} p={6} r="2xl">
      <Tabs
        variant="contained"
        size="lg"
        value={activeFundingTab}
        onValueChange={onFundingTabChange}
      >
        <TabPanel
          title="Overview"
          value="overview"
          testid="oui-testid-funding-overview-tab"
        >
          <FundingOverviewWidget />
        </TabPanel>
        <TabPanel
          title="Comparison"
          value="comparison"
          testid="oui-testid-funding-comparison-tab"
        >
          <FundingComparisonWidget />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
