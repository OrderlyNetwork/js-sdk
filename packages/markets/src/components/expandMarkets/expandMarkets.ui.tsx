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

export type ExpandMarketsProps = UseExpandMarketsScriptReturn;

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder="Search"
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
              className="oui-text-base-contrast-36 oui-cursor-pointer"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
    />
  );

  const cls = "oui-h-[calc(100%_-_36px)]";

  return (
    <Box className={cn("oui-font-semibold oui-overflow-hidden")} height="100%">
      <Box px={3} pb={2}>
        {search}
      </Box>
      <Tabs
        variant="contained"
        size="md"
        value={activeTab}
        onValueChange={onTabChange}
        classNames={{
          tabsList: "oui-my-[6px] oui-px-3",
          tabsContent: "oui-h-full",
        }}
        className={cls}
      >
        <TabPanel title="Favorites" icon={<FavoritesIcon />} value="favorites">
          <div className={cls}>
            <FavoritesListWidget
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
        <TabPanel title="Recent" value="recent">
          <div className={cls}>
            <RecentListWidget
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
        <TabPanel title="All" value="all">
          <div className={cls}>
            <MarketsListWidget
              type="all"
              sortKey={tabSort?.sortKey}
              sortOrder={tabSort?.sortOrder}
              onSort={onTabSort}
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
        <TabPanel title="New listings" value="newListing">
          <div className={cls}>
            <MarketsListWidget
              type="all"
              sortKey={tabSort?.sortKey}
              sortOrder={tabSort?.sortOrder}
              onSort={onTabSort}
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
      </Tabs>
    </Box>
  );
};
