import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  cn,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { MarketsListWidget } from "../../../components/marketsList";
import { useMarketsContext } from "../../../components/marketsProvider";
import { useFavoritesProps } from "../../../components/shared/hooks/useFavoritesExtraProps";
import {
  AllMarketsIcon,
  FavoritesIcon,
  NewListingsIcon,
  SearchIcon,
} from "../../../icons";
import { MarketsTabName } from "../../../type";
import { useMarketsDataListColumns } from "./column";
import { UseMarketsDataListScript } from "./marketsDataList.script";

export type MobileMarketsDataListProps = UseMarketsDataListScript;

export const MobileMarketsDataList: React.FC<MobileMarketsDataListProps> = (
  props,
) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;
  const { t } = useTranslation();

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const getColumns = useMarketsDataListColumns();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
      className={cn(
        "oui-mx-3 oui-mb-4 oui-mt-5",
        activeTab !== MarketsTabName.Favorites && "oui-mb-2",
      )}
      size="sm"
      data-testid="oui-testid-markets-searchMarket-input"
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

  const { renderHeader, dataFilter } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    const extraProps =
      type === MarketsTabName.Favorites ? { renderHeader, dataFilter } : {};

    return (
      <>
        {search}
        <MarketsListWidget
          type={type}
          initialSort={tabSort[type]}
          onSort={onTabSort(type)}
          getColumns={getColumns}
          rowClassName="!oui-h-[34px]"
          {...extraProps}
        />
      </>
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
          tabsList: "oui-mx-3",
        }}
      >
        <TabPanel
          title={t("markets.favorites")}
          icon={<FavoritesIcon />}
          value="favorites"
        >
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>
        <TabPanel
          title={t("markets.allMarkets")}
          icon={<AllMarketsIcon />}
          value="all"
        >
          {renderTab(MarketsTabName.All)}
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
