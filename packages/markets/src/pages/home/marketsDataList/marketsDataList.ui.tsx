import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, RwaIcon, TabPanel, Tabs } from "@orderly.network/ui";
import { CommunityBrokerTabs } from "../../../components/communityBrokerTabs";
import { FavoritesEmpty } from "../../../components/favoritesEmpty";
import { RwaIconTab } from "../../../components/rwaTab";
import { createCommunityBrokerFilter } from "../../../hooks/useCommunityTabs";
import { AllMarketsIcon, FavoritesIcon, NewListingsIcon } from "../../../icons";
import { MarketsTabName } from "../../../type";
import { UseMarketsDataListScript } from "./marketsDataList.script";

const LazySearchInput = React.lazy(() =>
  import("../../../components/searchInput").then((mod) => {
    return { default: mod.SearchInput };
  }),
);

const LazyFavoritesListFullWidget = React.lazy(() =>
  import("../../../components/favoritesListFull").then((mod) => {
    return { default: mod.FavoritesListFullWidget };
  }),
);

const LazyMarketsListFullWidget = React.lazy(() =>
  import("../../../components/marketsListFull").then((mod) => {
    return { default: mod.MarketsListFullWidget };
  }),
);

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { searchValue, activeTab, onTabChange } = props;
  const { t } = useTranslation();

  return (
    <Box id="oui-markets-list" intensity={900} p={6} r="2xl">
      <Tabs
        variant="contained"
        size="xl"
        value={activeTab}
        onValueChange={onTabChange}
        trailing={
          <React.Suspense fallback={null}>
            <LazySearchInput classNames={{ root: "oui-my-1 oui-w-[240px]" }} />
          </React.Suspense>
        }
        classNames={{
          tabsList: "oui-tabs-markets-list",
          tabsContent: "oui-tabs-markets-content",
        }}
        className="oui-markets-list-tabs"
      >
        <TabPanel
          classNames={{
            trigger: "oui-tabs-favorites-trigger",
            content: "oui-tabs-favorites-content",
          }}
          title={<FavoritesIcon />}
          value="favorites"
          testid="oui-testid-markets-favorites-tab"
        >
          <React.Suspense fallback={null}>
            <LazyFavoritesListFullWidget
              emptyView={
                !searchValue && (
                  <FavoritesEmpty
                    onClick={() => onTabChange(MarketsTabName.All)}
                  />
                )
              }
            />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-community-trigger",
            content: "oui-tabs-community-content",
          }}
          title={t("markets.community")}
          value="community"
          testid="oui-testid-markets-community-tab"
        >
          <CommunityBrokerTabs
            storageKey="orderly_markets_datalist_community_sel_sub_tab"
            size="md"
            classNames={{
              tabsList: "oui-px-3 oui-pt-1 oui-pb-2",
              tabsContent: "oui-h-full",
            }}
            className="oui-marketsDataList-community-tabs"
            showScrollIndicator
            renderPanel={(selected) => (
              <React.Suspense fallback={null}>
                <LazyMarketsListFullWidget
                  type="all"
                  initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
                  dataFilter={createCommunityBrokerFilter(selected)}
                />
              </React.Suspense>
            )}
          />
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-all-trigger",
            content: "oui-tabs-all-content",
          }}
          title={t("markets.allMarkets")}
          icon={<AllMarketsIcon />}
          value="all"
          testid="oui-testid-markets-all-tab"
        >
          <React.Suspense fallback={null}>
            <LazyMarketsListFullWidget
              type="all"
              initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
            />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-rwa-trigger",
            content: "oui-tabs-rwa-content",
          }}
          title={<RwaIconTab />}
          value="rwa"
          testid="oui-testid-markets-rwa-tab"
        >
          <React.Suspense fallback={null}>
            <LazyMarketsListFullWidget
              type="rwa"
              initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
            />
          </React.Suspense>
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-newListings-trigger",
            content: "oui-tabs-newListings-content",
          }}
          title={t("markets.newListings")}
          icon={<NewListingsIcon />}
          value="new"
          testid="oui-testid-markets-newListings-tab"
        >
          <React.Suspense fallback={null}>
            <LazyMarketsListFullWidget
              type="new"
              initialSort={{ sortKey: "created_time", sortOrder: "desc" }}
            />
          </React.Suspense>
        </TabPanel>
      </Tabs>
    </Box>
  );
};
