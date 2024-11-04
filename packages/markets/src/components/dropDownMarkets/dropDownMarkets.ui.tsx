import { PropsWithChildren } from "react";
import {
  Box,
  CloseIcon,
  cn,
  Flex,
  Input,
  TabPanel,
  Tabs,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@orderly.network/ui";
import { FavoritesIcon, SearchIcon } from "../../icons";
import { useMarketsContext } from "../marketsProvider";
import { FavoritesListWidget } from "../favoritesList";
import { MarketsListWidget } from "../marketsList";
import { RecentListWidget } from "../recentList";
import { UseDropDownMarketsScriptReturn } from "./dropDownMarkets.script";
import { getDropDownMarketsColumns } from "./column";

export type DropDownMarketsProps = UseDropDownMarketsScriptReturn & {
  contentClassName?: string;
};

export const DropDownMarkets: React.FC<
  PropsWithChildren<DropDownMarketsProps>
> = (props) => {
  return (
    <DropdownMenuRoot open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="start"
          alignOffset={-32}
          sideOffset={20}
          className={cn(
            "oui-markets-dropdown-menu-content oui-bg-base-8 oui-p-0",
            props.contentClassName
          )}
        >
          <DropDownMarketsConetnt {...props} hide={props.hide} />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export const DropDownMarketsConetnt: React.FC<DropDownMarketsProps> = (
  props
) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const { searchValue, onSearchValueChange } = useMarketsContext();

  const search = (
    <Flex mx={3} gapX={3} pt={3} pb={2}>
      <Input
        value={searchValue}
        onValueChange={onSearchValueChange}
        placeholder="Search"
        classNames={{
          root: "oui-border oui-mt-[1px] oui-border-line oui-flex-1",
        }}
        size="sm"
        prefix={
          <Box pl={3} pr={1}>
            <SearchIcon className="oui-text-base-contrast-36" />
          </Box>
        }
        autoComplete="off"
      />
      <CloseIcon
        size={12}
        className="oui-text-base-contrast-80 oui-cursor-pointer"
        onClick={props.hide}
        opacity={1}
      />
    </Flex>
  );

  const cls = "oui-h-[calc(100%_-_36px)]";

  return (
    <Box
      className={cn("oui-font-semibold oui-overflow-hidden")}
      height="100%"
      intensity={800}
    >
      {search}

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
              getColumns={getDropDownMarketsColumns}
              tableClassNames={{
                root: "!oui-bg-base-8",
                scroll: "oui-pb-5 oui-px-1",
              }}
              rowClassName="!oui-h-[34px]"
            />
          </div>
        </TabPanel>
        <TabPanel title="Recent" value="recent">
          <div className={cls}>
            <RecentListWidget
              getColumns={getDropDownMarketsColumns}
              tableClassNames={{
                root: "!oui-bg-base-8",
                scroll: "oui-pb-5 oui-px-1",
              }}
              rowClassName="!oui-h-[34px]"
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
              getColumns={getDropDownMarketsColumns}
              tableClassNames={{
                root: "!oui-bg-base-8",
                scroll: "oui-pb-5 oui-px-1",
              }}
              rowClassName="!oui-h-[34px]"
            />
          </div>
        </TabPanel>
      </Tabs>
    </Box>
  );
};
