import { useCallback } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Column, TabPanel, Tabs } from "@orderly.network/ui";
import { CommunityBrokerTabs } from "../../../components/communityBrokerTabs";
import { MarketsListWidget } from "../../../components/marketsList";
import { RwaIconTab } from "../../../components/rwaTab";
import { SearchInput } from "../../../components/searchInput";
import {
  get24hVolOIColumn,
  getLastAnd24hPercentageColumn,
  getMarkIndexColumn,
  getSymbolColumn,
} from "../../../components/shared/column";
import { useFavoritesProps } from "../../../components/shared/hooks/useFavoritesExtraProps";
import { createCommunityBrokerFilter } from "../../../hooks/useCommunityTabs";
import { AllMarketsIcon, FavoritesIcon, NewListingsIcon } from "../../../icons";
import { FavoriteInstance, MarketsTabName } from "../../../type";
import { UseMarketsDataListScript } from "./marketsDataList.script";

export type MobileMarketsDataListProps = UseMarketsDataListScript;

export const MobileMarketsDataList: React.FC<MobileMarketsDataListProps> = (
  props,
) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;
  const { t } = useTranslation();

  const getColumns = useCallback(
    (favorite: FavoriteInstance, isFavoriteList = false) => {
      return [
        getSymbolColumn(favorite, isFavoriteList),
        get24hVolOIColumn(),
        getLastAnd24hPercentageColumn(favorite, isFavoriteList),
        getMarkIndexColumn(),
      ] as Column[];
    },
    [],
  );

  const { getFavoritesProps } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    return (
      <>
        <SearchInput
          classNames={{
            root: cn(
              "oui-mx-3 oui-mb-4 oui-mt-5",
              activeTab !== MarketsTabName.Favorites && "oui-mb-2",
            ),
          }}
        />
        <MarketsListWidget
          type={type}
          initialSort={tabSort[type]}
          onSort={onTabSort(type)}
          getColumns={getColumns}
          rowClassName="!oui-h-[34px]"
          {...getFavoritesProps(type)}
        />
      </>
    );
  };

  const renderCommunityList = (selected: string) => {
    return (
      <MarketsListWidget
        type={MarketsTabName.All}
        initialSort={tabSort[MarketsTabName.Community]}
        onSort={onTabSort(MarketsTabName.Community)}
        getColumns={getColumns}
        rowClassName="!oui-h-[34px]"
        dataFilter={createCommunityBrokerFilter(selected)}
      />
    );
  };

  return (
    <Box id="oui-markets-list" intensity={900} py={3} mt={2} r="2xl">
      <Tabs
        variant="contained"
        size="lg"
        value={activeTab}
        onValueChange={onTabChange}
        classNames={{
          scrollIndicator: "oui-mx-3",
        }}
        showScrollIndicator
      >
        <TabPanel title={<FavoritesIcon />} value="favorites">
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>
        <TabPanel title={t("markets.community")} value="community">
          <SearchInput
            classNames={{
              root: cn(
                "oui-mx-3 oui-mb-4 oui-mt-5",
                activeTab !== MarketsTabName.Favorites && "oui-mb-2",
              ),
            }}
          />
          <CommunityBrokerTabs
            storageKey="orderly_mobile_markets_datalist_community_sel_sub_tab"
            size="md"
            classNames={{
              tabsList: "oui-px-3 oui-pt-1 oui-pb-2",
              tabsContent: "oui-h-full",
              scrollIndicator: "oui-mx-3",
            }}
            className="oui-mobileMarketsDataList-community-tabs"
            showScrollIndicator
            renderPanel={renderCommunityList}
          />
        </TabPanel>
        <TabPanel
          title={t("markets.allMarkets")}
          icon={<AllMarketsIcon />}
          value="all"
        >
          {renderTab(MarketsTabName.All)}
        </TabPanel>
        <TabPanel title={<RwaIconTab />} value="rwa">
          {renderTab(MarketsTabName.Rwa)}
        </TabPanel>
        <TabPanel
          title={t("markets.newListings")}
          icon={<NewListingsIcon />}
          value="new"
        >
          {renderTab(MarketsTabName.NewListing)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
