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
import { NewListingListWidget } from "../newListingList";
import { useTranslation } from "@orderly.network/i18n";

export type ExpandMarketsProps = UseExpandMarketsScriptReturn;

export const ExpandMarkets: React.FC<ExpandMarketsProps> = (props) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const { t } = useTranslation();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.sidebar.search.placeholder")}
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
          tabsList: cn("oui-my-[6px]"),
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-3",
        }}
        className={cls}
        showScrollIndicator
      >
        <TabPanel
          title={t("markets.sidebar.tabs.favorites")}
          icon={<FavoritesIcon />}
          value="favorites"
        >
          <div className={cls}>
            <FavoritesListWidget
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
        <TabPanel title={t("markets.sidebar.tabs.recent")} value="recent">
          <div className={cls}>
            <RecentListWidget
              tableClassNames={{
                scroll: "oui-px-1",
              }}
            />
          </div>
        </TabPanel>
        <TabPanel title={t("markets.sidebar.tabs.all")} value="all">
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
        <TabPanel
          title={t("markets.sidebar.tabs.newListings")}
          value="newListing"
        >
          <div className={cls}>
            <NewListingListWidget
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
