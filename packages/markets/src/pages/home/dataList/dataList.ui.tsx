import { PropsWithChildren } from "react";
import {
  Box,
  Button,
  Card,
  CheckedSquareFillIcon,
  CheckSquareEmptyIcon,
  CloseCircleFillIcon,
  CloseIcon,
  Divider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Input,
  ScrollArea,
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import {
  useFavoritesDropdownMenuScript,
  UseMarketsDataListScript,
} from "./dataList.script";
import { FavoritesWidget } from "./favorites";
import { MarketListWidget } from "./marketList";
import {
  AllMarketsIcon,
  CirclePlusIcon,
  FavoritesIcon,
  NewListingsIcon,
  SearchIcon,
} from "../../../icons";
import { TFavorite } from "../../../type";
import { useMarketsContext } from "../provider";

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
          <FavoritesWidget />
        </TabPanel>
        <TabPanel title="All Markets" icon={<AllMarketsIcon />} value="all">
          <MarketListWidget type="all" sortKey="24h_amount" sortOrder="desc" />
        </TabPanel>
        <TabPanel title="New listings" icon={<NewListingsIcon />} value="new">
          <MarketListWidget
            type="new"
            sortKey="created_time"
            sortOrder="desc"
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

export type FavoritesDropdownMenuProps = PropsWithChildren<{
  row: any;
  favorite: TFavorite;
}>;

export const FavoritesDropdownMenu: React.FC<FavoritesDropdownMenuProps> = (
  props
) => {
  const { symbol } = props.row || {};
  const { favoriteTabs } = props.favorite;

  const {
    open,
    onOpenChange,
    inputVisible,
    selectedTabs,
    value,
    onValueChange,
    hide,
    hideInput,
    showInput,
    onCheck,
    addTab,
    confirm,
  } = useFavoritesDropdownMenuScript(props);

  const renderInput = () => {
    if (inputVisible) {
      return (
        <Input
          autoFocus
          value={value}
          onValueChange={onValueChange}
          classNames={{
            root: "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
          }}
          suffix={
            <Flex itemAlign="center" gapX={2} mr={2}>
              <Text
                className={
                  "oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer"
                }
                onClick={addTab}
              >
                Add
              </Text>
              <CloseCircleFillIcon
                size={20}
                className="oui-text-base-contrast-20 hover:oui-text-base-contrast oui-cursor-pointer"
                onClick={hideInput}
              />
            </Flex>
          }
        />
      );
    }

    return (
      <Flex
        gapX={2}
        className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
        p={2}
        onClick={showInput}
      >
        <CirclePlusIcon />
        <Text size="sm">Add a new watchlist</Text>
      </Flex>
    );
  };

  const header = (
    <Flex justify="between" className="oui-mt-3 oui-mb-[10px]">
      <Flex gapX={1}>
        Select lists for
        <Text.formatted
          rule="symbol"
          formatString="base-type"
          size="base"
          showIcon
        >
          {symbol}
        </Text.formatted>
      </Flex>
      <CloseIcon
        size={16}
        className="oui-text-base-contrast oui-cursor-pointer"
        onClick={hide}
      />
    </Flex>
  );

  const content = (
    <ScrollArea>
      <Box my={2} className="oui-max-h-[200px]">
        {favoriteTabs?.map((item) => {
          const checked = !!selectedTabs.find((tab) => tab.id === item.id);
          return (
            <Box key={item.id} className="oui-cursor-pointer">
              <Flex
                className="oui-gap-x-[6px] hover:oui-bg-base-6"
                p={2}
                r="md"
                onClick={() => {
                  onCheck(item, checked);
                }}
              >
                {checked ? (
                  <CheckedSquareFillIcon
                    size={18}
                    className="oui-text-base-contrast-80"
                  />
                ) : (
                  <CheckSquareEmptyIcon
                    size={18}
                    className="oui-text-base-contrast-80"
                  />
                )}

                <Text intensity={54}>{item.name}</Text>
              </Flex>
            </Box>
          );
        })}
        {renderInput()}
      </Box>
    </ScrollArea>
  );

  const footer = (
    <Flex gapX={3} mt={3}>
      <Button
        key="secondary"
        color="gray"
        onClick={hide}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        Cancel
      </Button>

      <Button
        key="primary"
        onClick={confirm}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        Confirm
      </Button>
    </Flex>
  );

  return (
    <DropdownMenuRoot open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="start"
          sideOffset={20}
          className="oui-markets-favorite-dropdown-menu-content oui-bg-base-8"
        >
          <Box px={5} pb={5} width={360}>
            <Text as="div" size="sm" weight="semibold">
              {header}
              <Divider />
              {content}
              {footer}
            </Text>
          </Box>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
