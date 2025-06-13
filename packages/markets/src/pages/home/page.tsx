import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs, Text } from "@orderly.network/ui";
import {
  MarketsProvider,
  MarketsProviderProps,
} from "../../components/marketsProvider";
import { MarketsDataListWidget } from "./dataList";
import { FundingWidget } from "./funding/funding.widget";
import { MarketsHeaderWidget } from "./header/header.widget";

export type MarketsHomePageProps = MarketsProviderProps & {
  className?: string;
};

export const MarketsHomePage: FC<MarketsHomePageProps> = (props) => {
  const [activeTab, setActiveTab] = useState("markets");
  const { t } = useTranslation();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <Box
        id="oui-markets-home-page"
        className={cn("oui-font-semibold", props.className)}
        p={6}
      >
        <Tabs
          variant="text"
          size="xl"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabPanel
            title={t("common.markets")}
            value="markets"
            testid="oui-testid-markets-tab"
          >
            <MarketsHeaderWidget />
            <MarketsDataListWidget />
          </TabPanel>
          <TabPanel
            title={t("common.funding")}
            value="funding"
            testid="oui-testid-funding-tab"
          >
            <FundingWidget />
          </TabPanel>
        </Tabs>
      </Box>
    </MarketsProvider>
  );
};
