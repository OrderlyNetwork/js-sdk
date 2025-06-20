import { useTranslation } from "@orderly.network/i18n";
import { Box, TabPanel, Tabs } from "@orderly.network/ui";
import { FavoritesListFullWidget } from "../../../components/favoritesListFull";
import { MarketsListFullWidget } from "../../../components/marketsListFull";
import { SearchInput } from "../../../components/searchInput.tsx";
import { AllMarketsIcon, FavoritesIcon, NewListingsIcon } from "../../../icons";
import { UseMarketsDataListScript } from "./marketsDataList.script";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { activeTab, onTabChange } = props;
  const { t } = useTranslation();

  return (
    <Box id="oui-markets-list" intensity={900} p={6} r="2xl">
      <Tabs
        variant="contained"
        size="xl"
        value={activeTab}
        onValueChange={onTabChange}
        trailing={
          <SearchInput classNames={{ root: "oui-my-1 oui-w-[240px]" }} />
        }
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
