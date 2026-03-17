import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs } from "@orderly.network/ui";
import { createCommunityBrokerFilter } from "../../hooks/useCommunityTabs";
import { FavoritesIcon } from "../../icons";
import { MarketsTabName } from "../../type";
import { CommunityBrokerTabs } from "../communityBrokerTabs";
import { RwaTab } from "../rwaTab";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import type { ExpandMarketsScriptReturn } from "./expandMarkets.script";

const LazySearchInput = React.lazy(() =>
  import("../searchInput").then((mod) => {
    return { default: mod.SearchInput };
  }),
);

const LazyMarketsListWidget = React.lazy(() =>
  import("../marketsList").then((mod) => {
    return { default: mod.MarketsListWidget };
  }),
);

export type ExpandMarketsProps = ExpandMarketsScriptReturn;

const cls = "oui-h-[calc(100%_-_36px)]";

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { t } = useTranslation();

  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    return (
      <div className={cls}>
        <React.Suspense fallback={null}>
          <LazyMarketsListWidget
            type={type}
            initialSort={tabSort[type]}
            onSort={onTabSort(type)}
            tableClassNames={{
              root: "oui-expandMarkets-list",
              scroll: cn(
                "oui-px-1",
                type === MarketsTabName.Favorites ? "oui-pb-9" : "oui-pb-2",
              ),
            }}
            {...getFavoritesProps(type)}
            emptyView={renderEmptyView({
              type,
              onClick: () => {
                onTabChange(MarketsTabName.All);
              },
            })}
          />
        </React.Suspense>
      </div>
    );
  };

  const renderCommunityList = (selected: string) => {
    return (
      <div className={cls}>
        <React.Suspense fallback={null}>
          <LazyMarketsListWidget
            type={MarketsTabName.All}
            initialSort={tabSort[MarketsTabName.Community]}
            onSort={onTabSort(MarketsTabName.Community)}
            tableClassNames={{
              root: "oui-expandMarkets-list",
              scroll: cn("oui-px-1", "oui-pb-2"),
            }}
            dataFilter={createCommunityBrokerFilter(selected)}
          />
        </React.Suspense>
      </div>
    );
  };

  return (
    <Box
      className={cn(
        "oui-markets-expandMarkets",
        "oui-overflow-hidden oui-font-semibold",
      )}
      height="100%"
    >
      <Box className="oui-expandMarkets-header" px={3} pb={2}>
        <React.Suspense fallback={null}>
          <LazySearchInput
            classNames={{ root: "oui-expandMarkets-search-input" }}
          />
        </React.Suspense>
      </Box>
      <Tabs
        variant="contained"
        size="md"
        value={activeTab}
        onValueChange={onTabChange}
        classNames={{
          tabsList: cn("oui-my-[6px]"),
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-3",
        }}
        className={cn("oui-expandMarkets-tabs", cls)}
        showScrollIndicator
      >
        <TabPanel
          classNames={{
            trigger: "oui-tabs-favorites-trigger",
            content: "oui-tabs-favorites-content",
          }}
          title={<FavoritesIcon />}
          value={MarketsTabName.Favorites}
        >
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-community-trigger",
            content: "oui-tabs-community-content",
          }}
          title={t("markets.community")}
          value={MarketsTabName.Community}
        >
          <CommunityBrokerTabs
            storageKey="orderly_expand_markets_community_sel_sub_tab"
            classNames={{
              tabsList: "oui-px-3 oui-pt-1 oui-pb-2",
              tabsContent: "oui-h-full",
            }}
            className={cn("oui-expandMarkets-community-tabs", cls)}
            showScrollIndicator
            renderPanel={renderCommunityList}
          />
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-all-trigger",
            content: "oui-tabs-all-content",
          }}
          title={t("common.all")}
          value={MarketsTabName.All}
        >
          {renderTab(MarketsTabName.All)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-rwa-trigger",
            content: "oui-tabs-rwa-content",
          }}
          title={<RwaTab />}
          value={MarketsTabName.Rwa}
        >
          {renderTab(MarketsTabName.Rwa)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-newListings-trigger",
            content: "oui-tabs-newListings-content",
          }}
          title={t("markets.newListings")}
          value={MarketsTabName.NewListing}
        >
          {renderTab(MarketsTabName.NewListing)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-recent-trigger",
            content: "oui-tabs-recent-content",
          }}
          title={t("markets.recent")}
          value={MarketsTabName.Recent}
        >
          {renderTab(MarketsTabName.Recent)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
