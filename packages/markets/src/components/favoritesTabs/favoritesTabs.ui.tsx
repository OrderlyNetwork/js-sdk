import { KeyboardEventHandler } from "react";
import {
  Box,
  cn,
  Flex,
  Text,
  Tooltip,
  Input,
  modal,
} from "@orderly.network/ui";
import { FavoriteTab } from "@orderly.network/hooks";
import {
  UseFavoritesTabScriptOptions,
  UseFavoritesTabScriptReturn,
} from "./favoritesTabs.script";
import { AddIcon, AddIcon2, EditIcon, TrashIcon } from "../../icons";
import "../../style/index.css";

export type FavoritesTabProps = UseFavoritesTabScriptReturn &
  Pick<UseFavoritesTabScriptOptions, "size">;

export const FavoritesTab: React.FC<FavoritesTabProps> = (props) => {
  const {
    open,
    setOpen,
    inputRef,
    inputWidth,
    spanRef,
    editing,
    value,
    onValueChange,
    updateCurTab,
    onEdit,
    addTab,
    delTab,
    size = "default",
  } = props;

  const { selectedFavoriteTab, favoriteTabs, updateSelectedFavoriteTab } =
    props.favorite;

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
              "oui-p-0 oui-rounded oui-px-2",
              "focus-visible:oui-outline-none focus-within:oui-outline-transparent",
              size === "sm" ? "oui-h-[18px]" : "oui-h-[24px]",
              isActive &&
                "oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
            ),
            input: cn(
              "oui-font-semibold oui-text-transparent",
              "oui-gradient-brand oui-caret-[rgba(217,217,217,1)]",
              size === "sm" ? "oui-text-2xs" : "oui-text-sm"
            ),
          }}
          onKeyUp={onKeyUp}
          autoComplete="off"
        />
      );
    } else if (isActive) {
      content = (
        <Text.gradient
          color="brand"
          angle={270}
          weight="semibold"
          size={size === "sm" ? "2xs" : "sm"}
          className={
            size === "sm" ? "oui-leading-[18px]" : "oui-leading-[24px]"
          }
          as="div"
        >
          {item.name}
        </Text.gradient>
      );
    } else {
      content = (
        <Text
          weight="semibold"
          size={size === "sm" ? "2xs" : "sm"}
          className={
            size === "sm" ? "oui-leading-[18px]" : "oui-leading-[24px]"
          }
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
        height={size === "sm" ? 18 : 24}
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
          updateSelectedFavoriteTab(item);
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
      gapX={size === "sm" ? 2 : 3}
      id="oui-markets-favorites-tabs-container"
      className="oui-overflow-hidden oui-overflow-x-auto oui-cursor-pointer hide-scrollbar"
    >
      {favoriteTabs?.map((item: any) => {
        const isActive = selectedFavoriteTab.id === item.id;
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
              <Flex gapX={2} itemAlign="center" px={2} py={1}>
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
        className="oui-bg-[linear-gradient(270deg,rgba(89,176,254,0.12)_0%,rgba(38,254,254,0.12)_100%)]"
        width={size === "sm" ? 28 : 36}
        height={size === "sm" ? 18 : 24}
        r="base"
        justify="center"
        itemAlign="center"
        onClick={addTab}
      >
        <AddIcon2 className="oui-w-4 oui-h-4" />
      </Flex>
      <Text size="xs" ref={spanRef} className="oui-invisible">
        {value}
      </Text>
    </Flex>
  );
};
