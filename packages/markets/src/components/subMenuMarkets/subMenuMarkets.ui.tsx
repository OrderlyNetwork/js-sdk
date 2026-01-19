import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  cn,
  Tabs,
  TabPanel,
  Flex,
  TokenIcon,
  Badge,
  EmptyDataState,
} from "@orderly.network/ui";
import { FavoritesIcon } from "../../icons";
import {
  MarketsTabName,
  type FavoriteInstance,
  type SortType,
} from "../../type";
import { FavoritesTabWidget } from "../favoritesTabs";
import { MarketsListWidget } from "../marketsList";
import { RwaIconTab } from "../rwaTab";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import { SymbolDisplay } from "../symbolDisplay";

const LIST_ROW_COMPACT = "oui-h-auto";
const TABLE_CLASSNAMES = {
  scroll: "oui-px-0",
  header: "oui-hidden oui-h-0 oui-p-0",
};

const LazySearchInput = React.lazy(() =>
  import("../searchInput").then((mod) => ({ default: mod.SearchInput })),
);

export type SubMenuMarketsProps = {
  activeTab: MarketsTabName;
  onTabChange: (value: string) => void;
  className?: string;
  tabSort: Record<MarketsTabName, SortType | undefined>;
  onTabSort: (type: MarketsTabName) => (sort?: SortType) => void;
};

const cls = "oui-h-[calc(100%_-_36px)]";

type MarketTabPanelProps = {
  type: MarketsTabName;
  getColumns: (_favorite: FavoriteInstance, _isFavoritesList: boolean) => any[];
  initialSort?: SortType;
  onSort?: (sort?: SortType) => void;
  dataFilter?: any;
  renderHeader?: (favorite: FavoriteInstance) => React.ReactNode;
  emptyView?: React.ReactNode;
};

const MarketTabPanel: React.FC<MarketTabPanelProps> = ({
  type,
  getColumns,
  initialSort,
  onSort,
  dataFilter,
  renderHeader,
  emptyView,
}) => {
  return (
    <div className={cls}>
      <MarketsListWidget
        type={type}
        getColumns={getColumns}
        tableClassNames={TABLE_CLASSNAMES}
        rowClassName={LIST_ROW_COMPACT}
        dataFilter={dataFilter}
        renderHeader={renderHeader}
        initialSort={initialSort}
        onSort={onSort}
        emptyView={emptyView}
      />
    </div>
  );
};

export const SubMenuMarkets: React.FC<SubMenuMarketsProps> = (props) => {
  const { activeTab, onTabChange, className, tabSort, onTabSort } = props;
  const { t } = useTranslation();
  const { getFavoritesProps } = useFavoritesProps();

  const getColumns = (
    _favorite: FavoriteInstance,
    _isFavoritesList: boolean,
  ) => {
    return [
      {
        title: "",
        dataIndex: "symbol",
        className: "oui-p-2",
        render: (_: unknown, record: any) => {
          return (
            <div className="oui-mx-[-8px]">
              <Flex gapX={1} itemAlign="center">
                <TokenIcon symbol={record.symbol} className="oui-size-[18px]" />
                <SymbolDisplay formatString="base" size="2xs">
                  {record.symbol}
                </SymbolDisplay>
                <Badge size="xs" color="primary">
                  {record.leverage}x
                </Badge>
              </Flex>
            </div>
          );
        },
      },
    ];
  };

  return (
    <Box
      className={cn(
        "oui-overflow-hidden oui-font-semibold oui-bg-base-9",
        className,
      )}
      height="100%"
    >
      <Box className="oui-p-1">
        <React.Suspense fallback={null}>
          <LazySearchInput />
        </React.Suspense>
      </Box>
      <Tabs
        variant="contained"
        size="md"
        value={activeTab}
        onValueChange={onTabChange}
        classNames={{
          tabsList: cn("oui-my-1"),
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-1",
        }}
        className={cn(cls, "oui-my-1.5")}
        showScrollIndicator
      >
        <TabPanel title={<FavoritesIcon />} value={MarketsTabName.Favorites}>
          {(() => {
            const favProps = getFavoritesProps(MarketsTabName.Favorites) as {
              dataFilter?: any;
            };
            return (
              <MarketTabPanel
                type={MarketsTabName.Favorites}
                getColumns={getColumns}
                dataFilter={favProps?.dataFilter}
                renderHeader={(favorite) => (
                  <Box className="oui-px-1 oui-my-1">
                    <FavoritesTabWidget favorite={favorite} size="sm" />
                  </Box>
                )}
                initialSort={tabSort[MarketsTabName.Favorites]}
                onSort={onTabSort(MarketsTabName.Favorites)}
                emptyView={<EmptyDataState />}
              />
            );
          })()}
        </TabPanel>
        <TabPanel title={t("common.all")} value={MarketsTabName.All}>
          <MarketTabPanel
            type={MarketsTabName.All}
            getColumns={getColumns}
            initialSort={tabSort[MarketsTabName.All]}
            onSort={onTabSort(MarketsTabName.All)}
          />
        </TabPanel>
        <TabPanel title={<RwaIconTab />} value={MarketsTabName.Rwa}>
          <MarketTabPanel
            type={MarketsTabName.Rwa}
            getColumns={getColumns}
            initialSort={tabSort[MarketsTabName.Rwa]}
            onSort={onTabSort(MarketsTabName.Rwa)}
          />
        </TabPanel>
        <TabPanel
          title={t("markets.newListings")}
          value={MarketsTabName.NewListing}
        >
          <MarketTabPanel
            type={MarketsTabName.NewListing}
            getColumns={getColumns}
            initialSort={tabSort[MarketsTabName.NewListing]}
            onSort={onTabSort(MarketsTabName.NewListing)}
          />
        </TabPanel>
        <TabPanel title={t("markets.recent")} value={MarketsTabName.Recent}>
          <MarketTabPanel
            type={MarketsTabName.Recent}
            getColumns={getColumns}
            initialSort={tabSort[MarketsTabName.Recent]}
            onSort={onTabSort(MarketsTabName.Recent)}
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
