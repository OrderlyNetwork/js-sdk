import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { FavoritesListFullWidget } from "../../../components/favoritesListFull";
import { MarketsListFullWidget } from "../../../components/marketsListFull";
import { useMarketsContext } from "../../../components/marketsProvider";
import {
  AllMarketsIcon,
  FavoritesIcon,
  NewListingsIcon,
  SearchIcon,
} from "../../../icons";
import { UseMarketsDataListScript } from "./dataList.script";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { activeTab, onTabChange } = props;
  const { t } = useTranslation();

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
      className="oui-my-1 oui-w-[240px]"
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

  return (
    <Box id="oui-markets-list" intensity={900} p={6} r="2xl">
      <Tabs
        variant="contained"
        size="xl"
        value={activeTab}
        onValueChange={onTabChange}
        trailing={search}
      >
        <TabPanel
          title={t("markets.favorites")}
          icon={<FavoritesIcon />}
          value="favorites"
          testid="oui-testid-markets-favorites-tab"
        >
          <FavoritesListFullWidget />
        </TabPanel>
        <TabPanel
          title={t("markets.allMarkets")}
          icon={<AllMarketsIcon />}
          value="all"
          testid="oui-testid-markets-all-tab"
        >
          <MarketsListFullWidget
            type="all"
            initialSort={{
              sortKey: "24h_amount",
              sortOrder: "desc",
            }}
          />
        </TabPanel>
        <TabPanel
          title={t("markets.newListings")}
          icon={<NewListingsIcon />}
          value="new"
          testid="oui-testid-markets-newListings-tab"
        >
          <MarketsListFullWidget
            type="new"
            initialSort={{
              sortKey: "created_time",
              sortOrder: "desc",
            }}
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
