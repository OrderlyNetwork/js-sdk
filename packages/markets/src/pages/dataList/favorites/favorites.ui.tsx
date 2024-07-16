import { FC, useRef, useState } from "react";
import {
  Box,
  cn,
  DataTable,
  Flex,
  Pagination,
  Text,
  Tooltip,
  Input,
} from "@orderly.network/ui";
import { useDataListColumns } from "../column";
import { type UseFavoritesReturn } from "./favorites.script";
import { modal } from "@orderly.network/ui";
import { EditIcon, TrashIcon, AddIcon } from "../../icons";
import { FavoriteTab } from "@orderly.network/hooks";

type FavoritesProps = {} & UseFavoritesReturn;
export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite } = props;
  const columns = useDataListColumns(favorite, true);

  return (
    <div>
      <FavoritesTab favorite={favorite} />

      <DataTable
        bordered
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
        columns={columns}
        dataSource={dataSource}
        onRow={(record, index) => {
          return {
            className: "oui-h-[55px] oui-border-line-12",
          };
        }}
        generatedRowKey={(record) => record.symbol}
      >
        <Pagination
          {...meta}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </DataTable>
    </div>
  );
};

type FavoritesTabProps = Pick<FavoritesProps, "favorite">;

const FavoritesTab: React.FC<FavoritesTabProps> = (props) => {
  const {
    favorites,
    favoriteTabs,
    updateFavoriteTabs,
    updateSelectedFavoriteTab,
    updateSymbolFavoriteState,
    curTab,
    setCurTab,
  } = props.favorite || {};

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("test");
  const input = useRef<HTMLInputElement>(null);

  const addTab = () => {
    const newTab = {
      name: `WatchList_${favoriteTabs.length}`,
      id: Date.now(),
    };
    updateFavoriteTabs(newTab, { add: true });
    setCurTab(newTab);
    updateSelectedFavoriteTab(newTab);
  };

  const onBlur = () => {
    updateFavoriteTabs(
      {
        ...curTab,
        name: value,
      },
      { update: true }
    );
    setEditing(false);
  };

  const onEdit = (item: any) => () => {
    setEditing(true);
    setValue(item.name);
    setTimeout(() => {
      input.current?.focus();
      input.current?.setSelectionRange(-1, -1);
    }, 0);
  };

  const doDel = (selectedTab: any) => {
    updateFavoriteTabs(selectedTab, { delete: true });

    setTimeout(() => {
      // remove all symbol favorite in this tab
      favorites.forEach((item) => {
        const find = item.tabs?.find((tab) => tab.id === selectedTab.id);
        if (find) {
          updateSymbolFavoriteState(
            { symbol: item.name } as any,
            selectedTab,
            true
          );
        }
      });

      // auto selected last tab
      const tabs = favoriteTabs.filter((item) => item.id !== selectedTab.id);
      const tab = tabs?.[tabs?.length - 1] || tabs?.[0];
      setCurTab(tab);
      updateSelectedFavoriteTab(tab);
    }, 0);
  };

  const onDel = (item: any) => () => {
    modal.confirm({
      title: "Delete list",
      content: (
        <Text size="sm">{`Are you sure you want to delete ${item.name}?`}</Text>
      ),
      onOk() {
        doDel(item);
        return Promise.resolve();
      },
    });
  };

  const renderContent = (item: FavoriteTab, isActive: boolean) => {
    let content;
    if (editing && isActive) {
      // DOTO: text move follow cursor
      return (
        <Input
          ref={input}
          value={value}
          style={{
            // @ts-ignore
            "--oui-gradient-angle": "270deg",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            WebkitBackgroundClip: "text",
          }}
          onValueChange={setValue}
          onBlur={onBlur}
          classNames={{
            root: cn(
              "oui-padding-0 oui-h-[18px] oui-rounded",
              "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
              isActive &&
                "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            ),
            input: cn(
              "oui-w-[50px] oui-text-2xs oui-font-semibold oui-text-transparent oui-caret-[rgba(217,217,217,1)]",
              "oui-gradient-brand"
            ),
          }}
        />
      );
    } else if (isActive) {
      content = (
        <Text.gradient
          color="brand"
          angle={270}
          weight="semibold"
          size="2xs"
          className=" oui-leading-[18px] "
          as="div"
        >
          {item.name}
        </Text.gradient>
      );
    } else {
      content = (
        <Text
          weight="semibold"
          size="2xs"
          className="oui-leading-[18px]"
          as="div"
        >
          {item.name}
        </Text>
      );
    }

    return (
      <Box
        r="base"
        px={2}
        height={18}
        className={cn(
          "oui-cursor-pointer oui-select-none",
          isActive
            ? "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            : "oui-bg-line-6 oui-text-base-contrast-36 hover:oui-text-base-contrast"
        )}
        onClick={() => {
          setCurTab(item);
          updateSelectedFavoriteTab(item);
        }}
      >
        {content}
      </Box>
    );
  };

  return (
    <Flex my={3} gapX={3}>
      {favoriteTabs?.map((item: any) => {
        const isActive = curTab.id === item.id;
        return (
          <Tooltip
            key={item.id}
            open={isActive && !editing ? undefined : false}
            // @ts-ignore
            content={
              <Flex gapX={2} itemAlign="center" px={2} py={1}>
                <EditIcon
                  className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
                  onClick={onEdit(item)}
                />
                <TrashIcon
                  className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
                  onClick={onDel(item)}
                />
              </Flex>
            }
            delayDuration={0}
            className="oui-bg-base-5"
            arrow={{
              className: "oui-fill-base-5",
            }}
          >
            {renderContent(item, isActive)}
          </Tooltip>
        );
      })}
      <Flex
        className="oui-bg-line-6 oui-cursor-pointer oui-text-base-contrast-36 hover:oui-text-base-contrast"
        width={32}
        height={18}
        r="base"
        justify="center"
        itemAlign="center"
        onClick={addTab}
      >
        <AddIcon className="oui-w-4 oui-h-4" />
      </Flex>
    </Flex>
  );
};
