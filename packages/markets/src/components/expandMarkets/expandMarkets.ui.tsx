import React from "react";
import { Box, cn, TabPanel, Tabs } from "@orderly.network/ui";
import { createCommunityBrokerFilter } from "../../hooks/useCommunityTabs";
import { MarketsTabName } from "../../type";
import { CommunityBrokerTabs } from "../communityBrokerTabs";
import { useMarketsContext } from "../marketsProvider";
import { RwaTab } from "../rwaTab";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import {
  isBuiltInMarketTab,
  tabKey,
  resolveTabTitle,
  useBuiltInTitles,
  useCustomTabDataFilters,
} from "../shared/tabUtils";
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

  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();
  const builtInTitles = useBuiltInTitles();
  const { tabs } = useMarketsContext();
  const tabDataFilters = useCustomTabDataFilters(tabs);

  const renderBuiltInContent = (type: string) => {
    const tabType = type as MarketsTabName;
    return (
      <div className={cls}>
        <React.Suspense fallback={null}>
          <LazyMarketsListWidget
            type={tabType}
            initialSort={tabSort[type]}
            onSort={onTabSort(tabType)}
            tableClassNames={{
              root: "oui-expandMarkets-list",
              scroll: cn(
                "oui-px-1",
                tabType === MarketsTabName.Favorites ? "oui-pb-9" : "oui-pb-2",
              ),
            }}
            {...getFavoritesProps(tabType)}
            emptyView={renderEmptyView({
              type: tabType,
              onClick: () => {
                onTabChange(MarketsTabName.All);
              },
            })}
          />
        </React.Suspense>
      </div>
    );
  };

  const renderCommunityContent = () => {
    return (
      <CommunityBrokerTabs
        storageKey="orderly_expand_markets_community_sel_sub_tab"
        classNames={{
          tabsList: "oui-px-3 oui-pt-1 oui-pb-2",
          tabsContent: "oui-h-full",
        }}
        className={cn("oui-expandMarkets-community-tabs", cls)}
        showScrollIndicator
        renderPanel={(selected) => (
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
        )}
      />
    );
  };

  const renderCustomContent = (key: string) => {
    return (
      <div className={cls}>
        <React.Suspense fallback={null}>
          <LazyMarketsListWidget
            type={MarketsTabName.All}
            dataFilter={(data) => tabDataFilters[key]?.(data) ?? data}
            initialSort={tabSort[key]}
            onSort={onTabSort(key as MarketsTabName)}
            tableClassNames={{
              root: "oui-expandMarkets-list",
              scroll: cn("oui-px-1", "oui-pb-2"),
            }}
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
        {tabs?.map((tab, index) => {
          const key = tabKey(tab, index);
          const isBuiltIn = isBuiltInMarketTab(tab);
          const isCommunity =
            isBuiltIn && tab.type === MarketsTabName.Community;

          return (
            <TabPanel
              key={key}
              classNames={{
                trigger: `oui-tabs-${key}-trigger`,
                content: `oui-tabs-${key}-content`,
              }}
              title={resolveTabTitle(tab, builtInTitles, <RwaTab />)}
              value={key}
            >
              {isCommunity
                ? renderCommunityContent()
                : isBuiltIn
                  ? renderBuiltInContent(tab.type)
                  : renderCustomContent(key)}
            </TabPanel>
          );
        })}
      </Tabs>
    </Box>
  );
};
