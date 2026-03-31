import { useCallback, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Column, TabPanel, Tabs } from "@orderly.network/ui";
import { CommunityBrokerTabs } from "../../../components/communityBrokerTabs";
import { MarketsListWidget } from "../../../components/marketsList";
import { useMarketsContext } from "../../../components/marketsProvider";
import { RwaIconTab } from "../../../components/rwaTab";
import { SearchInput } from "../../../components/searchInput";
import {
  get24hVolOIColumn,
  getLastAnd24hPercentageColumn,
  getSymbolColumn,
} from "../../../components/shared/column";
import { useFavoritesProps } from "../../../components/shared/hooks/useFavoritesExtraProps";
import {
  composeTabTitle,
  isBuiltInMarketTab,
  tabKey,
  resolveTabTitle,
  resolveTabTriggerIcon,
  useCustomTabDataFilters,
} from "../../../components/shared/tabUtils";
import { createCommunityBrokerFilter } from "../../../hooks/useCommunityTabs";
import { AllMarketsIcon, FavoritesIcon, NewListingsIcon } from "../../../icons";
import { FavoriteInstance, MarketsTabName } from "../../../type";
import { UseMarketsDataListScript } from "./marketsDataList.script";

export type MobileMarketsDataListProps = UseMarketsDataListScript;

type BuiltInTabMeta = {
  title: React.ReactNode;
  icon?: React.ReactElement;
  value: string;
  tabName?: MarketsTabName;
};

export const MobileMarketsDataList: React.FC<MobileMarketsDataListProps> = (
  props,
) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;
  const { t } = useTranslation();
  const { tabs } = useMarketsContext();
  const tabDataFilters = useCustomTabDataFilters(tabs);

  const getColumns = useCallback(
    (favorite: FavoriteInstance, isFavoriteList = false) => {
      return [
        getSymbolColumn(favorite, isFavoriteList, {
          stackLeverageInSecondRow: true,
        }),
        get24hVolOIColumn(),
        getLastAnd24hPercentageColumn(favorite, isFavoriteList),
      ] as Column[];
    },
    [],
  );

  const { getFavoritesProps } = useFavoritesProps();

  const builtInMeta = useMemo<Record<string, BuiltInTabMeta>>(
    () => ({
      favorites: {
        title: <FavoritesIcon />,
        value: "favorites",
        tabName: MarketsTabName.Favorites,
      },
      community: {
        title: t("markets.community"),
        value: "community",
      },
      all: {
        title: t("markets.allMarkets"),
        icon: <AllMarketsIcon />,
        value: "all",
        tabName: MarketsTabName.All,
      },
      rwa: {
        title: <RwaIconTab />,
        value: "rwa",
        tabName: MarketsTabName.Rwa,
      },
      newListing: {
        title: t("markets.newListings"),
        icon: <NewListingsIcon />,
        value: "new",
        tabName: MarketsTabName.NewListing,
      },
    }),
    [t],
  );

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
        {tabs?.map((tab, index) => {
          const key = tabKey(tab, index);
          const isBuiltIn = isBuiltInMarketTab(tab);

          // Built-in tab
          const meta = isBuiltIn ? builtInMeta[tab.type] : undefined;
          if (isBuiltIn && meta) {
            const title =
              tab.type === "favorites"
                ? composeTabTitle(tab.name, {
                    icon: resolveTabTriggerIcon(tab, <FavoritesIcon />),
                    suffix: tab.suffix,
                  })
                : tab.type === "rwa"
                  ? resolveTabTitle(tab, {}, <RwaIconTab />)
                  : composeTabTitle(tab.name ?? meta.title, {
                      suffix: tab.suffix,
                    });

            return (
              <TabPanel
                key={key}
                title={title}
                icon={
                  tab.type === "favorites" || tab.type === "rwa"
                    ? undefined
                    : resolveTabTriggerIcon(tab, meta.icon)
                }
                value={meta.value}
              >
                {tab.type === "community" ? (
                  <>
                    <SearchInput
                      classNames={{
                        root: cn("oui-mx-3 oui-mb-4 oui-mt-5", "oui-mb-2"),
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
                  </>
                ) : (
                  renderTab(meta.tabName!)
                )}
              </TabPanel>
            );
          }

          // Custom category
          return (
            <TabPanel
              key={key}
              title={composeTabTitle(tab.name ?? key, {
                icon: resolveTabTriggerIcon(tab),
                suffix: tab.suffix,
              })}
              value={key}
            >
              <SearchInput
                classNames={{
                  root: cn("oui-mx-3 oui-mb-4 oui-mt-5", "oui-mb-2"),
                }}
              />
              <MarketsListWidget
                type={MarketsTabName.All}
                dataFilter={(data) => tabDataFilters[key]?.(data) ?? data}
                initialSort={tabSort[key as MarketsTabName]}
                onSort={onTabSort(key as MarketsTabName)}
                getColumns={getColumns}
                rowClassName="!oui-h-[34px]"
              />
            </TabPanel>
          );
        })}
      </Tabs>
    </Box>
  );
};
