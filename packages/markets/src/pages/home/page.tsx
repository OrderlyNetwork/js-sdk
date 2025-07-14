import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs, useScreen } from "@orderly.network/ui";
import {
  LeftNavProps,
  RouterAdapter,
  LeftNavUI,
} from "@orderly.network/ui-scaffold";
import {
  MarketsProvider,
  MarketsProviderProps,
} from "../../components/marketsProvider";
import { MarketsPageTab } from "../../type";
import { FundingWidget } from "./funding/funding.widget";
import { MarketsDataListWidget } from "./marketsDataList";
import { MarketsHeaderWidget } from "./marketsHeader/marketsHeader.widget";

export type MarketsHomePageProps = MarketsProviderProps & {
  className?: string;
};

export const MarketsHomePage: FC<MarketsHomePageProps> = (props) => {
  const { isMobile } = useScreen();

  const [activeTab, setActiveTab] = useState<MarketsPageTab>(
    MarketsPageTab.Markets,
  );

  return (
    <MarketsProvider
      onSymbolChange={props.onSymbolChange}
      navProps={props.navProps}
    >
      <div
        id="oui-markets-home-page"
        className={cn("oui-font-semibold", props.className)}
      >
        {isMobile ? (
          <MarketsMobileContent
            activeTab={activeTab}
            onTabChange={setActiveTab}
            navProps={props.navProps}
          />
        ) : (
          <MarketsDesktopContent
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </div>
    </MarketsProvider>
  );
};

type MarketsContentProps = {
  activeTab: MarketsPageTab;
  onTabChange: (value: MarketsPageTab) => void;
  // only for mobile
  navProps?: {
    logo?: {
      src: string;
      alt: string;
    };
    routerAdapter?: RouterAdapter;
    leftNav?: LeftNavProps;
  };
};

const MarketsDesktopContent = (props: MarketsContentProps) => {
  const { t } = useTranslation();

  return (
    <Box p={6}>
      <Tabs
        size="xl"
        value={props.activeTab}
        onValueChange={props.onTabChange as (value: string) => void}
      >
        <TabPanel
          title={t("common.markets")}
          value={MarketsPageTab.Markets}
          testid="oui-testid-markets-tab"
        >
          <MarketsHeaderWidget className="oui-mt-4" />
          <MarketsDataListWidget />
        </TabPanel>
        <TabPanel
          title={t("common.funding")}
          value={MarketsPageTab.Funding}
          testid="oui-testid-funding-tab"
        >
          <FundingWidget />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

const MarketsMobileContent = (props: MarketsContentProps) => {
  const { t } = useTranslation();

  return (
    <Tabs
      variant="text"
      size="xl"
      value={props.activeTab}
      onValueChange={props.onTabChange as (value: string) => void}
      classNames={{
        tabsListContainer: "oui-border-0",
        tabsList: "oui-mx-6 oui-my-2",
        trigger: cn(
          "oui-text-2xl oui-font-bold",
          "data-[state=active]:after:oui-bg-transparent!",
        ),
        tabsContent: "oui-px-3",
      }}
      leading={
        props.navProps?.leftNav && (
          <LeftNavUI
            className="oui-ml-3 -oui-mr-4"
            {...props?.navProps?.leftNav}
            logo={props?.navProps?.logo}
            routerAdapter={props?.navProps?.routerAdapter}
          />
        )
      }
    >
      <TabPanel
        title={t("common.markets")}
        value="markets"
        testid="oui-testid-markets-tab"
      >
        <MarketsHeaderWidget className="oui-mt-2" />
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
  );
};
