import { FC } from "react";
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
import { EditIcon, TrashIcon, AddIcon } from "../../../../icons";
import { TFavorite } from "../../../../type";
import { UseFavoritesReturn, useFavoritesTabScript } from "./favorites.script";

type FavoritesProps = {} & UseFavoritesReturn;

export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite, onSort } = props;
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
            className: cn(
              "group",
              "oui-h-[55px] oui-border-line-4 oui-cursor-pointer"
            ),
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
    inputRef,
    inputWidth,
    spanRef,
    editing,
    value,
    onValueChange,
    onBlur,
    onEdit,
    onAdd,
    addTab,
    delTab,
  } = useFavoritesTabScript(props.favorite);

  const onDel = (item: any) => {
    modal.confirm({
      title: "Delete list",
      contentClassName: "oui-markets-home-page",
      content: (
        <Text size="sm">{`Are you sure you want to delete ${item.name}?`}</Text>
      ),
      onOk() {
        delTab(item);
        return Promise.resolve();
      },
    });
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
          onBlur={onBlur}
          classNames={{
            root: cn(
              "oui-padding-0 oui-h-[18px] oui-rounded oui-px-2",
              "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
              isActive &&
                "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            ),
            input: cn(
              "oui-text-2xs oui-font-semibold oui-text-transparent",
              "oui-gradient-brand oui-caret-[rgba(217,217,217,1)]"
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
          className="oui-leading-[18px]"
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
            ? "oui-markets-favorites-active-tab-item"
            : "oui-markets-favorites-tab-item",
          isActive
            ? "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            : "oui-bg-line-6 oui-text-base-contrast-36 hover:oui-text-base-contrast"
        )}
        onClick={() => {
          onAdd(item);
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
                  onClick={() => {
                    onEdit(item);
                  }}
                />
                <TrashIcon
                  className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
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
