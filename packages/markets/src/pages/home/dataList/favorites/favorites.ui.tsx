import { FC, KeyboardEventHandler } from "react";
import {
  Box,
  cn,
  DataTable,
  Flex,
  Pagination,
  Text,
  Tooltip,
  Input,
  modal,
} from "@orderly.network/ui";
import { FavoriteTab } from "@orderly.network/hooks";
import { useDataListColumns } from "../column";
import {
  EditIcon,
  TrashIcon,
  AddIcon,
  UnFavoritesIcon,
} from "../../../../icons";
import { TFavorite } from "../../../../type";
import { UseFavoritesReturn, useFavoritesTabScript } from "./favorites.script";
import { useMarketsContext } from "../../provider";
import "../../../../style/index.css";

type FavoritesProps = {} & UseFavoritesReturn;

export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite, onSort, loading } =
    props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useDataListColumns(favorite, true);

  const emptyView = (
    <Flex>
      <Text size="xs" intensity={36}>
        Click on the
      </Text>
      <UnFavoritesIcon className="oui-text-base-contrast-36" />
      <Text size="xs" intensity={36}>
        icon next to a market to add it to your list.
      </Text>
    </Flex>
  );

  return (
    <div>
      <FavoritesTab favorite={favorite} />

      <DataTable
        bordered
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80 !oui-min-h-[187.5px]",
        }}
        columns={columns}
        dataSource={dataSource}
        emptyView={emptyView}
        loading={loading}
        onRow={(record, index) => {
          return {
            className: cn(
              "group",
              "oui-h-[55px] oui-border-line-4 oui-cursor-pointer"
            ),
            "data-testid": `oui-testid-markets-favorites-tr-${record.symbol}`,
            onClick: () => {
              onSymbolChange?.(record);
            },
          };
        }}
        generatedRowKey={(record) => record.symbol}
        onSort={onSort}
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

type FavoritesTabProps = {
  favorite: TFavorite;
};

const FavoritesTab: React.FC<FavoritesTabProps> = (props) => {
  const { curTab, favoriteTabs } = props.favorite;

  const {
    open,
    setOpen,
    inputRef,
    inputWidth,
    spanRef,
    editing,
    value,
    onValueChange,
    updateSelectedTab,
    updateCurTab,
    onEdit,
    addTab,
    delTab,
  } = useFavoritesTabScript(props.favorite);

  const onDel = (item: any) => {
    modal.confirm({
      title: "Delete list",
      content: (
        <Text size="sm">{`Are you sure you want to delete ${item.name}?`}</Text>
      ),
      onOk() {
        delTab(item);
        return Promise.resolve();
      },
    });
  };

  const onKeyUp: KeyboardEventHandler = (e) => {
    if (e.key === "Enter") {
      updateCurTab();
    }
  };

  const renderContent = (item: FavoriteTab, isActive: boolean) => {
    let content;
    if (editing && isActive) {
      return (
        <Input
          ref={inputRef}
          value={value}
          style={{
            // @ts-ignore
            "--oui-gradient-angle": "270deg",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            WebkitBackgroundClip: "text",
            width: inputWidth,
          }}
          onValueChange={onValueChange}
          onBlur={updateCurTab}
          classNames={{
            root: cn(
              "oui-p-0 oui-h-[24px] oui-rounded oui-px-2",
              "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
              isActive &&
                "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            ),
            input: cn(
              "oui-text-sm oui-font-semibold oui-text-transparent",
              "oui-gradient-brand oui-caret-[rgba(217,217,217,1)]"
            ),
          }}
          onKeyUp={onKeyUp}
        />
      );
    } else if (isActive) {
      content = (
        <Text.gradient
          color="brand"
          angle={270}
          weight="semibold"
          size="sm"
          className="oui-leading-[24px]"
          as="div"
           data-testid="oui-markets-favorite-tab-subTab"
        >
          {item.name}
        </Text.gradient>
      );
    } else {
      content = (
        <Text
          weight="semibold"
          size="sm"
          className="oui-leading-[24px]"
          as="div"
          data-testid="oui-markets-favorite-tab-subTab"
        >
          {item.name}
        </Text>
      );
    }

    return (
      <Box
        r="base"
        px={2}
        height={24}
        className={cn(
          "oui-cursor-pointer oui-select-none",
          isActive
            ? "oui-markets-favorites-active-tab-item"
            : "oui-markets-favorites-tab-item",
          isActive
            ? "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            : "oui-bg-line-6 oui-text-base-contrast-36 hover:oui-text-base-contrast"
        )}
        onClick={() => {
          updateSelectedTab(item);
          if (isActive) {
            setOpen(true);
          }
        }}
      >
        {content}
      </Box>
    );
  };

  return (
    <Flex
      my={3}
      gapX={3}
      id="oui-markets-favorites-tabs-container"
      className="oui-overflow-hidden oui-overflow-x-auto oui-cursor-pointer "
    >
      {favoriteTabs?.map((item: any) => {
        const isActive = curTab.id === item.id;
        return (
          <Tooltip
            key={item.id}
            open={isActive && !editing ? open : false}
            onOpenChange={(open) => {
              if (isActive) {
                setOpen(open);
              }
            }}
            // @ts-ignore
            content={
              <Flex gapX={2} itemAlign="center" px={2} py={1} >
                <EditIcon
                  className="oui-text-base-contrast-36 hover:oui-text-base-contrast oui-cursor-pointer"
                  onClick={() => {
                    onEdit(item);
                  }}
                />
                <TrashIcon
                  className="oui-text-base-contrast-36 hover:oui-text-base-contrast oui-cursor-pointer"
                  onClick={() => {
                    onDel(item);
                  }}
                />
              </Flex>
            }
            delayDuration={0}
            className={cn("oui-bg-base-5")}
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
      <Text size="xs" ref={spanRef} className="oui-invisible">
        {value}
      </Text>
    </Flex>
  );
};
