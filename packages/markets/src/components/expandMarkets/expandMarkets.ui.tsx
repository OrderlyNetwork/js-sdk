import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, TabPanel, Tabs } from "@orderly.network/ui";
import { FavoritesIcon } from "../../icons";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { SearchInput } from "../searchInput.tsx";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import { ExpandMarketsScriptReturn } from "./expandMarkets.script";

export type ExpandMarketsProps = ExpandMarketsScriptReturn;

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { t } = useTranslation();

  const cls = "oui-h-[calc(100%_-_36px)]";

  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    return (
      <div className={cls}>
        <MarketsListWidget
          type={type}
          initialSort={tabSort[type]}
          onSort={onTabSort(type)}
          tableClassNames={{
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
      </div>
    );
  };

  return (
    <Box className={cn("oui-overflow-hidden oui-font-semibold")} height="100%">
      <Box px={3} pb={2}>
        <SearchInput />
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
        className={cls}
        showScrollIndicator
      >
        <TabPanel
          title={t("markets.favorites")}
          icon={<FavoritesIcon />}
          value={MarketsTabName.Favorites}
        >
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>
        <TabPanel title={t("markets.recent")} value={MarketsTabName.Recent}>
          {renderTab(MarketsTabName.Recent)}
        </TabPanel>
        <TabPanel title={t("common.all")} value={MarketsTabName.All}>
          {renderTab(MarketsTabName.All)}
        </TabPanel>
        <TabPanel
          title={t("markets.newListings")}
          value={MarketsTabName.NewListing}
        >
          {renderTab(MarketsTabName.NewListing)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
