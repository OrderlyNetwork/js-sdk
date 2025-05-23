import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  cn,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { FavoritesIcon, SearchIcon } from "../../icons";
import { TabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import { ExpandMarketsScriptReturn } from "./expandMarkets.script";

export type ExpandMarketsProps = ExpandMarketsScriptReturn;

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const { t } = useTranslation();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
      classNames={{ root: "oui-border oui-mt-[1px] oui-border-line" }}
      size="sm"
      prefix={
        <Box pl={3} pr={1}>
          <SearchIcon className="oui-text-base-contrast-36" />
        </Box>
      }
      suffix={
        searchValue && (
          <Box mr={2}>
            <CloseCircleFillIcon
              size={14}
              className="oui-cursor-pointer oui-text-base-contrast-36"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
    />
  );

  const cls = "oui-h-[calc(100%_-_36px)]";

  const { renderHeader, dataFilter } = useFavoritesProps();

  const renderTab = (type: TabName) => {
    const extraProps =
      type === TabName.Favorites ? { renderHeader, dataFilter } : {};

    return (
      <div className={cls}>
        <MarketsListWidget
          type={type}
          initialSort={tabSort[type]}
          onSort={onTabSort(type)}
          tableClassNames={{
            scroll: cn(
              "oui-px-1",
              type === TabName.Favorites ? "oui-pb-9" : "oui-pb-2",
            ),
          }}
          {...extraProps}
        />
      </div>
    );
  };

  return (
    <Box className={cn("oui-overflow-hidden oui-font-semibold")} height="100%">
      <Box px={3} pb={2}>
        {search}
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
          value={TabName.Favorites}
        >
          {renderTab(TabName.Favorites)}
        </TabPanel>
        <TabPanel title={t("markets.recent")} value={TabName.Recent}>
          {renderTab(TabName.Recent)}
        </TabPanel>
        <TabPanel title={t("common.all")} value={TabName.All}>
          {renderTab(TabName.All)}
        </TabPanel>
        <TabPanel title={t("markets.newListings")} value={TabName.NewListing}>
          {renderTab(TabName.NewListing)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
