import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  cn,
  Tabs,
  TabPanel,
  Flex,
  TokenIcon,
  Text,
  Badge,
} from "@orderly.network/ui";
import { FavoritesIcon } from "../../icons";
import { MarketsTabName, type FavoriteInstance } from "../../type";
import { FavoritesTabWidget } from "../favoritesTabs";
import { MarketsListWidget } from "../marketsList";
import { RwaTab } from "../rwaTab";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";

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
};

const cls = "oui-h-[calc(100%_-_36px)]";

export const SubMenuMarkets: React.FC<SubMenuMarketsProps> = (props) => {
  const { activeTab, onTabChange, className } = props;
  const { t } = useTranslation();
  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();

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
                <Text.formatted
                  rule="symbol"
                  formatString="base"
                  size="2xs"
                  weight="semibold"
                >
                  {record.symbol}
                </Text.formatted>
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
          <div className={cls}>
            {(() => {
              const favProps = getFavoritesProps(MarketsTabName.Favorites) as {
                dataFilter?: any;
              };
              return (
                <MarketsListWidget
                  type={MarketsTabName.Favorites}
                  getColumns={getColumns}
                  tableClassNames={TABLE_CLASSNAMES}
                  rowClassName={LIST_ROW_COMPACT}
                  dataFilter={favProps?.dataFilter}
                  renderHeader={(favorite) => (
                    <Box className="oui-px-1 oui-my-1">
                      <FavoritesTabWidget favorite={favorite} size="sm" />
                    </Box>
                  )}
                  emptyView={renderEmptyView({
                    type: MarketsTabName.Favorites,
                    onClick: () => onTabChange(MarketsTabName.All),
                  })}
                />
              );
            })()}
          </div>
        </TabPanel>
        <TabPanel title={t("common.all")} value={MarketsTabName.All}>
          <div className={cls}>
            <MarketsListWidget
              type={MarketsTabName.All}
              getColumns={getColumns}
              tableClassNames={TABLE_CLASSNAMES}
              rowClassName={LIST_ROW_COMPACT}
            />
          </div>
        </TabPanel>
        <TabPanel title={<RwaTab />} value={MarketsTabName.Rwa}>
          <div className={cls}>
            <MarketsListWidget
              type={MarketsTabName.Rwa}
              getColumns={getColumns}
              tableClassNames={TABLE_CLASSNAMES}
              rowClassName={LIST_ROW_COMPACT}
            />
          </div>
        </TabPanel>
        <TabPanel
          title={t("markets.newListings")}
          value={MarketsTabName.NewListing}
        >
          <div className={cls}>
            <MarketsListWidget
              type={MarketsTabName.NewListing}
              getColumns={getColumns}
              tableClassNames={TABLE_CLASSNAMES}
              rowClassName={LIST_ROW_COMPACT}
            />
          </div>
        </TabPanel>
        <TabPanel title={t("markets.recent")} value={MarketsTabName.Recent}>
          <div className={cls}>
            <MarketsListWidget
              type={MarketsTabName.Recent}
              getColumns={getColumns}
              tableClassNames={TABLE_CLASSNAMES}
              rowClassName={LIST_ROW_COMPACT}
            />
          </div>
        </TabPanel>
      </Tabs>
    </Box>
  );
};
