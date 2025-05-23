import { PropsWithChildren } from "react";
import { useTranslation } from "@orderly.network/i18n";
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
import { TabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
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

  const { searchValue, onSearchValueChange } = useMarketsContext();

  const { t } = useTranslation();

  const getColumns = useDropDownMarketsColumns();

  const search = (
    <Flex mx={3} gapX={3} pt={3} pb={2}>
      <Input
        value={searchValue}
        onValueChange={onSearchValueChange}
        placeholder={t("markets.search.placeholder")}
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
        className="oui-cursor-pointer oui-text-base-contrast-80"
        onClick={props.hide}
        opacity={1}
      />
    </Flex>
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
          getColumns={getColumns}
          tableClassNames={{
            root: "!oui-bg-base-8",
            scroll: "oui-pb-5 oui-px-1",
          }}
          rowClassName="!oui-h-[34px]"
          {...extraProps}
        />
      </div>
    );
  };

  return (
    <Box
      className={cn("oui-overflow-hidden oui-font-semibold")}
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
