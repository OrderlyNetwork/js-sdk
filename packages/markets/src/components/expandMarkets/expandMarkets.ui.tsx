import {
  Box,
  CloseCircleFillIcon,
  cn,
  Input,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { FavoritesIcon, SearchIcon } from "../../icons";
import { UseExpandMarketsScriptReturn } from "./expandMarkets.script";
import { useMarketsContext } from "../marketsProvider";
import { FavoritesListWidget } from "../favoritesList";
import { MarketsListWidget } from "../marketsList";
import { RecentListWidget } from "../recentList";
import "../../style/index.css";

export type ExpandMarketsProps = UseExpandMarketsScriptReturn;

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder="Search"
      classNames={{ root: "oui-my-2 oui-border oui-border-line" }}
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
    <Box className={cn("oui-font-semibold oui-h-full")}>
      <Box px={3}>{search}</Box>
      <Tabs
        variant="contained"
        size="md"
        value={activeTab}
        onValueChange={onTabChange}
        classNames={{
          tabsList: "oui-my-[6px] oui-px-3",
        }}
      >
        <TabPanel title="Favorites" icon={<FavoritesIcon />} value="favorites">
          <FavoritesListWidget />
        </TabPanel>
        <TabPanel title="Recent" value="recent">
          <RecentListWidget />
        </TabPanel>
        <TabPanel title="All" value="all">
          <MarketsListWidget type="all" sortKey="24h_change" sortOrder="desc" />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
