import type { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { FundingComparisonWidget } from "../../../components/fundingComparison";
import { FundingOverviewWidget } from "../../../components/fundingOverview";
import { useMarketsContext } from "../../../components/marketsProvider";
import { SearchIcon } from "../../../icons";
import { FundingScriptReturn } from "./funding.script";

export const MobileFunding: FC<FundingScriptReturn> = (props) => {
  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();
  const { t } = useTranslation();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
      className="oui-mb-2 oui-mt-5"
      size="sm"
      data-testid="oui-testid-markets-searchMarket-input"
      prefix={
        <Box pl={3} pr={1}>
          <SearchIcon className="oui-text-base-contrast-36" />
        </Box>
      }
      suffix={
        searchValue && (
          <Box mr={2}>
            <CloseCircleFillIcon
              size={14}
              className="oui-cursor-pointer oui-text-base-contrast-36"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
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
