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
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import { UseMarketsDataListScript } from "./dataList.script";
import { FavoritesWidget } from "./favorites";
import { MarketListWidget } from "./marketList";
import {
  AllMarketsIcon,
  CirclePlusIcon,
  FavoritesIcon,
  NewListingsIcon,
} from "../icons";
import { PropsWithChildren, useEffect, useState } from "react";
import { FavoriteTab } from "@orderly.network/hooks";
import { TFavorite } from "./favorites/favorites.script";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { activeTab, onTabChange } = props;
  return (
    <Card>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabPanel title="Favorites" icon={<FavoritesIcon />} value="favorites">
          <FavoritesWidget />
        </TabPanel>
        <TabPanel title="All Markets" icon={<AllMarketsIcon />} value="all">
          <MarketListWidget sortKey="24h_amount" sortOrder="desc" />
        </TabPanel>
        <TabPanel title="New listings" icon={<NewListingsIcon />} value="new">
          <MarketListWidget sortKey="created_time" sortOrder="desc" />
        </TabPanel>
      </Tabs>
    </Card>
  );
};

export type FavoritesDropdownMenuProps = PropsWithChildren<{
  favorite: TFavorite;
  row: any;
}>;

export const FavoritesDropdownMenu: React.FC<FavoritesDropdownMenuProps> = (
  props
) => {
  const { symbol } = props.row || {};
  const {
    favorites,
    favoriteTabs,
    updateFavoriteTabs,
    updateSymbolFavoriteState,
  } = props.favorite;
  const [open, setOpen] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [value, setValue] = useState("");
  const [selectedTabs, setSelectedTabs] = useState([] as FavoriteTab[]);

  const hide = () => {
    setOpen(false);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const hideInput = () => {
    setInputVisible(false);
  };

  const clearState = () => {
    setValue("");
    hideInput();
    setSelectedTabs([]);
  };

  const onAdd = () => {
    const newTab = {
      name: value || `WatchList_${favoriteTabs.length}`,
      id: Date.now(),
    };
    updateFavoriteTabs(newTab, { add: true });
    clearState();
  };

  const onCheck = (item: FavoriteTab, checked: boolean) => {
    if (checked) {
      setSelectedTabs(selectedTabs?.filter((tab) => tab.id !== item.id));
    } else {
      setSelectedTabs([...selectedTabs, item]);
    }
  };

  const onConfirm = () => {
    // if tab is arrary, the del params is not work
    // if tab is empty array, will be delete, otherwise will be override
    updateSymbolFavoriteState(props.row, selectedTabs, false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const find = favorites?.find((item) => item.name === symbol);
    if (find?.tabs?.length) {
      setSelectedTabs(find?.tabs);
    }
  }, [open, favorites, favoriteTabs, symbol]);

  useEffect(() => {
    if (!open) {
      clearState();
    }
  }, [open]);

  const renderInput = () => {
    if (inputVisible) {
      return (
        <Input
          autoFocus
          value={value}
          onValueChange={setValue}
          classNames={{
            root: "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
          }}
          suffix={
            <Flex itemAlign="center" gapX={2} mr={2}>
              <Text
                className={
                  "oui-text-base-contrast-54 hover:oui-text-base-contrast"
                }
                onClick={onAdd}
              >
                Add
              </Text>
              <CloseCircleFillIcon
                size={20}
                className="oui-text-base-contrast-20 hover:oui-text-base-contrast"
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
        <Text>Add a new watchlist</Text>
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
          weight="semibold"
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
    <Box my={2}>
      {favoriteTabs?.map((item) => {
        const checked = !!selectedTabs.find((tab) => tab.id === item.id);
        return (
          <Box key={item.id} className="oui-cursor-pointer oui-text-sm">
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
                  className=" oui-text-base-contrast-80"
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
  );

  const footer = (
    <Flex gapX={3} mt={3}>
      <Button
        key="secondary"
        color="gray"
        onClick={hide}
        fullWidth
        className="oui-text-sm"
      >
        Cancel
      </Button>

      <Button
        key="primary"
        onClick={onConfirm}
        fullWidth
        className="oui-text-sm"
      >
        Confirm
      </Button>
    </Flex>
  );
  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>{props.children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={20}
          className="oui-bg-base-8 oui-w-[360px] oui-px-[20px] oui-pb-[20px] oui-font-semibold"
        >
          {header}
          <Divider />
          {content}
          {footer}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
