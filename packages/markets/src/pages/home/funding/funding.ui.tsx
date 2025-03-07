import type { FC } from "react";
import {
  Box,
  CloseCircleFillIcon,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { FundingOverviewWidget } from "../../../components/fundingOverview";
import { FundingComparisonWidget } from "../../../components/fundingComparison";
import { UseFundingScript } from "./funding.script";
import { SearchIcon } from "../../../icons";
import { useMarketsContext } from "../../../components/marketsProvider";
import { useTranslation } from "@orderly.network/i18n";
export type FundingUIProps = UseFundingScript;

export const FundingUI: FC<FundingUIProps> = ({
  activeFundingTab,
  onFundingTabChange,
}) => {
  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();
  const { t } = useTranslation();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.funding.search.placeholder")}
      className="oui-w-[240px] oui-my-1"
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
              className="oui-text-base-contrast-36 oui-cursor-pointer"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
    />
  );

  return (
    <Box id="oui-funding-list" intensity={900} p={6} mt={4} r="2xl">
      <Tabs
        variant="contained"
        size="lg"
        value={activeFundingTab}
        onValueChange={onFundingTabChange}
        trailing={search}
      >
        <TabPanel
          title={t("markets.funding.tabs.overview")}
          value="overview"
          testid="oui-testid-funding-overview-tab"
        >
          <FundingOverviewWidget />
        </TabPanel>
        <TabPanel
          title={t("markets.funding.tabs.comparison")}
          value="comparison"
          testid="oui-testid-funding-comparison-tab"
        >
          <FundingComparisonWidget />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
