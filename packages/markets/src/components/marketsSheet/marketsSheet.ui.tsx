import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { RwaTab } from "../rwaTab";
import { SearchInput } from "../searchInput";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import {
  isBuiltInMarketTab,
  tabKey,
  resolveTabTitle,
  useBuiltInTitles,
  useCustomTabDataFilters,
} from "../shared/tabUtils";
import { getMarketsSheetColumns } from "./column";
import { MarketsSheetScriptReturn } from "./marketsSheet.script";

export type MarketsSheetProps = MarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className, tabSort, onTabSort } = props;

  const { t } = useTranslation();

  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();
  const { tabs } = useMarketsContext();
  const builtInTitles = useBuiltInTitles();
  const tabDataFilters = useCustomTabDataFilters(tabs);

  return (
    <Box
      height="100%"
      className={cn("oui-markets-marketsSheet", "oui-font-semibold", className)}
    >
      <Box className="oui-marketsSheet-header" px={3} mt={3} mb={2}>
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
        <SearchInput
          classNames={{ root: cn("oui-marketsSheet-search-input", "oui-mt-4") }}
        />
      </Box>

      <Tabs
        variant="contained"
        size="md"
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        classNames={{
          tabsList: cn("oui-my-[6px]"),
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-3",
        }}
        className={cn("oui-marketsSheet-tabs", "oui-h-[calc(100%_-_92px)]")}
        showScrollIndicator
      >
        {tabs?.map((tab, index) => {
          const key = tabKey(tab, index);
          const isBuiltIn = isBuiltInMarketTab(tab);
          const isFavorites = isBuiltIn && tab.type === "favorites";
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
              {isBuiltIn ? (
                <MarketsListWidget
                  type={tab.type as MarketsTabName}
                  initialSort={tabSort[tab.type]}
                  onSort={onTabSort(tab.type as MarketsTabName)}
                  getColumns={getMarketsSheetColumns}
                  tableClassNames={{
                    root: cn("oui-marketsSheet-list", "!oui-bg-base-8"),
                    scroll: cn(
                      "oui-pb-[env(safe-area-inset-bottom,_20px)]",
                      isFavorites
                        ? "oui-h-[calc(100%_-_70px)]"
                        : "oui-h-[calc(100%_-_40px)]",
                    ),
                  }}
                  emptyView={renderEmptyView({
                    type: tab.type as MarketsTabName,
                    onClick: () => {
                      props.onTabChange(MarketsTabName.All);
                    },
                  })}
                  {...getFavoritesProps(tab.type as MarketsTabName)}
                />
              ) : (
                <MarketsListWidget
                  type={MarketsTabName.All}
                  dataFilter={(data) => tabDataFilters[key]?.(data) ?? data}
                  initialSort={tabSort[key]}
                  onSort={onTabSort(key as MarketsTabName)}
                  getColumns={getMarketsSheetColumns}
                  tableClassNames={{
                    root: cn("oui-marketsSheet-list", "!oui-bg-base-8"),
                    scroll: cn(
                      "oui-pb-[env(safe-area-inset-bottom,_20px)]",
                      "oui-h-[calc(100%_-_40px)]",
                    ),
                  }}
                />
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </Box>
  );
};
