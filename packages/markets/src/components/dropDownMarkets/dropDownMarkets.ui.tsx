import { PropsWithChildren } from "react";
import { useTranslation } from "@orderly.network/i18n";
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
import { FavoritesIcon } from "../../icons";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { RwaTab } from "../rwaTab";
import { SearchInput } from "../searchInput";
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

  const { t } = useTranslation();

  const getColumns = useDropDownMarketsColumns();

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

  const renderTab = (type: MarketsTabName) => {
    return (
      <div className={cls}>
        <MarketsListWidget
          type={type}
          initialSort={tabSort[type]}
          onSort={onTabSort(type)}
          getColumns={getColumns}
          tableClassNames={{
            root: cn("oui-dropDownMarkets-list", "!oui-bg-base-8"),
            scroll: "oui-pb-5 oui-px-1",
          }}
          rowClassName="!oui-h-[34px]"
          {...getFavoritesProps(type)}
          emptyView={renderEmptyView({
            type,
            onClick: () => {
              onTabChange(MarketsTabName.All);
            },
          })}
        />
      </div>
    );
  };

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
          tabsList: "oui-my-[6px] oui-px-3",
          tabsContent: "oui-h-full",
        }}
        className={cn("oui-dropDownMarkets-tabs", cls)}
      >
        <TabPanel
          classNames={{
            trigger: "oui-tabs-favorites-trigger",
            content: "oui-tabs-favorites-content",
          }}
          title={<FavoritesIcon />}
          value={MarketsTabName.Favorites}
        >
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-all-trigger",
            content: "oui-tabs-all-content",
          }}
          title={t("common.all")}
          value={MarketsTabName.All}
        >
          {renderTab(MarketsTabName.All)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-rwa-trigger",
            content: "oui-tabs-rwa-content",
          }}
          title={<RwaTab />}
          value={MarketsTabName.Rwa}
        >
          {renderTab(MarketsTabName.Rwa)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-newListings-trigger",
            content: "oui-tabs-newListings-content",
          }}
          title={t("markets.newListings")}
          value={MarketsTabName.NewListing}
        >
          {renderTab(MarketsTabName.NewListing)}
        </TabPanel>
        <TabPanel
          classNames={{
            trigger: "oui-tabs-recent-trigger",
            content: "oui-tabs-recent-content",
          }}
          title={t("markets.recent")}
          value={MarketsTabName.Recent}
        >
          {renderTab(MarketsTabName.Recent)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
