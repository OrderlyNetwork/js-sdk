import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, TabPanel, Tabs } from "@orderly.network/ui";
import { FavoritesEmpty } from "../../../components/favoritesEmpty";
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
      >
        <TabPanel
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
