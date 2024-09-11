import {
  Box,
  CloseCircleFillIcon,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { UseMarketsDataListScript } from "./dataList.script";
import {
  AllMarketsIcon,
  FavoritesIcon,
  NewListingsIcon,
  SearchIcon,
} from "../../../icons";
import { useMarketsContext } from "../../../components/marketsProvider";
import { MarketsListFullWidget } from "../../../components/marketsListFull";
import { FavoritesListFullWidget } from "../../../components/favoritesListFull";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { activeTab, onTabChange } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder="Search market"
      className="oui-w-[240px] oui-my-1"
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
              className="oui-text-base-contrast-36 oui-cursor-pointer"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
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
        <TabPanel title="Favorites" icon={<FavoritesIcon />} value="favorites">
          <FavoritesListFullWidget />
        </TabPanel>
        <TabPanel title="All markets" icon={<AllMarketsIcon />} value="all">
          <MarketsListFullWidget
            type="all"
            sortKey="24h_amount"
            sortOrder="desc"
          />
        </TabPanel>
        <TabPanel title="New listings" icon={<NewListingsIcon />} value="new">
          <MarketsListFullWidget
            type="new"
            sortKey="created_time"
            sortOrder="desc"
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
