import { PropsWithChildren } from "react";
import {
  Box,
  CloseIcon,
  cn,
  Flex,
  TabPanel,
  Tabs,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@orderly.network/ui";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { RwaTab } from "../rwaTab";
import { SearchInput } from "../searchInput";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import {
  isBuiltInMarketTab,
  tabKey,
  resolveTabTitle,
  useBuiltInTitles,
  useCustomTabDataFilters,
} from "../shared/tabUtils";
import { useDropDownMarketsColumns } from "./column";
import { DropDownMarketsScriptReturn } from "./dropDownMarkets.script";

export type DropDownMarketsProps = DropDownMarketsScriptReturn & {
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
            props.contentClassName,
          )}
        >
          <DropDownMarketsConetnt {...props} hide={props.hide} />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export const DropDownMarketsConetnt: React.FC<DropDownMarketsProps> = (
  props,
) => {
  const { activeTab, onTabChange, tabSort, onTabSort } = props;

  const getColumns = useDropDownMarketsColumns();
  const builtInTitles = useBuiltInTitles();

  const search = (
    <Flex className="oui-dropDownMarkets-search" mx={3} gapX={3} pt={3} pb={2}>
      <SearchInput
        classNames={{
          root: "oui-w-full",
        }}
      />
      <CloseIcon
        size={12}
        className="oui-dropDownMarkets-close-btn oui-cursor-pointer oui-text-base-contrast-80"
        onClick={props.hide}
        opacity={1}
      />
    </Flex>
  );

  const cls = "oui-h-[calc(100%_-_36px)]";

  const { getFavoritesProps, renderEmptyView } = useFavoritesProps();
  const { tabs } = useMarketsContext();
  const tabDataFilters = useCustomTabDataFilters(tabs);

  return (
    <Box
      className={cn(
        "oui-markets-dropDownMarkets",
        "oui-overflow-hidden oui-font-semibold",
      )}
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
          tabsListContainer: "oui-px-3",
          tabsList: "oui-my-[6px]",
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-0",
        }}
        className={cn("oui-dropDownMarkets-tabs", cls)}
        showScrollIndicator
      >
        {tabs?.map((tab, index) => {
          const key = tabKey(tab, index);
          return (
            <TabPanel
              key={key}
              classNames={{
                trigger: `oui-tabs-${key}-trigger`,
                content: `oui-tabs-${key}-content`,
              }}
              title={resolveTabTitle(tab, builtInTitles, <RwaTab />)}
              value={key}
            >
              {isBuiltInMarketTab(tab) ? (
                <div className={cls}>
                  <MarketsListWidget
                    type={tab.type as MarketsTabName}
                    initialSort={tabSort[tab.type]}
                    onSort={onTabSort(tab.type as MarketsTabName)}
                    getColumns={getColumns}
                    tableClassNames={{
                      root: cn("oui-dropDownMarkets-list", "!oui-bg-base-8"),
                      scroll: "oui-pb-5 oui-px-1",
                    }}
                    rowClassName="!oui-h-[34px]"
                    {...getFavoritesProps(tab.type as MarketsTabName)}
                    emptyView={renderEmptyView({
                      type: tab.type as MarketsTabName,
                      onClick: () => {
                        onTabChange(MarketsTabName.All);
                      },
                    })}
                  />
                </div>
              ) : (
                <div className={cls}>
                  <MarketsListWidget
                    type={MarketsTabName.All}
                    dataFilter={tabDataFilters[key]}
                    initialSort={tabSort[key]}
                    onSort={onTabSort(key as MarketsTabName)}
                    getColumns={getColumns}
                    tableClassNames={{
                      root: cn("oui-dropDownMarkets-list", "!oui-bg-base-8"),
                      scroll: "oui-pb-5 oui-px-1",
                    }}
                    rowClassName="!oui-h-[34px]"
                  />
                </div>
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </Box>
  );
};
