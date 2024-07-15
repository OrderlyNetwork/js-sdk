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
import { useFavoritesColumns } from "./column";
import { type UseFavoritesReturn } from "./favorites.script";
import { modal } from "@orderly.network/ui";
import { EditIcon, TrashIcon, AddIcon } from "../../icons";
import { FavoriteTab } from "@orderly.network/hooks";

type FavoritesProps = {} & UseFavoritesReturn;

export const Favorites: FC<FavoritesProps> = (props) => {
  const { dataSource, meta, setPage, setPageSize, favorite } = props;
  const columns = useFavoritesColumns();

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
          return { className: "oui-h-[55px] oui-border-line-12" };
        }}
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
  const { favoriteTabs, updateFavoriteTabs, getLastSelFavTab } =
    props.favorite || {};
  const [curTab, setCurTab] = useState(getLastSelFavTab() || favoriteTabs[0]);
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
          onBlur={() => {
            updateFavoriteTabs(
              {
                ...curTab,
                name: value,
              },
              { update: true }
            );
            setEditing(false);
          }}
          classNames={{
            root: cn(
              "oui-padding-0 oui-h-[18px] oui-rounded",
              "focus-visible:oui-outline-none focus-within:oui-outline-transparent ",
              isActive &&
                "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            ),
            input: cn(
              "oui-w-[50px] oui-text-2xs oui-font-semibold oui-text-transparent oui-caret-[rgba(217,217,217,1)] ",
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
        }}
      >
        {content}
      </Box>
    );
  };

  return (
    <>
      {/* <DeleteFavoriteTabDialog /> */}
      <Flex my={3} gapX={3}>
        {favoriteTabs?.map((item: any) => {
          const isActive = curTab.id === item.id;
          return (
            <Tooltip
              key={item.name}
              open={isActive && !editing ? undefined : false}
              // @ts-ignore
              content={
                <Flex gapX={2} itemAlign="center" px={2} py={1}>
                  <EditIcon
                    className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
                    onClick={() => {
                      setEditing(true);
                      setValue(item.name);
                      setTimeout(() => {
                        input.current?.focus();
                        input.current?.setSelectionRange(-1, -1);
                      }, 0);
                    }}
                  />
                  <TrashIcon
                    className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
                    onClick={() => {
                      updateFavoriteTabs(item, { delete: true });
                      // modal.confirm({});
                      // return;
                    }}
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
    </>
  );
};
