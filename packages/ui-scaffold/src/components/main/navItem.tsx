import React, { FC, useCallback, useMemo } from "react";
import { cn, Text, Box, DropdownMenuItem } from "@orderly.network/ui";

export type MainNavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: MainNavItem[];
};

export const NavItem: FC<{
  item: MainNavItem;
  onClick?: (item: MainNavItem) => void;
  active?: boolean;
}> = (props) => {
  const onClickHandler = useCallback(() => {
    props.onClick?.(props.item);
  }, [props.item]);

  const menus = useMemo(() => {
    if (!Array.isArray(props.item.children)) return null;

    return props.item.children.map((item, index) => {
      return <DropdownMenuItem key={index} />;
    });
  }, [props.item.children]);

  const button = (
    <button
      disabled={props.item.disabled}
      data-actived={props.active}
      className={cn(
        "oui-text-base-contrast-36 oui-text-sm oui-relative oui-group oui-rounded oui-px-3 oui-py-1 oui-h-[32px]",
        props.active && "oui-bg-base-10"
      )}
      onClick={onClickHandler}
    >
      <Text.gradient color={props.active ? "brand" : "inherit"} angle={45}>
        {props.item.name}
      </Text.gradient>
      <Box
        invisible={!props.active}
        position="absolute"
        bottom={0}
        left={"50%"}
        height={"3px"}
        r="full"
        width={"38px"}
        gradient="brand"
        angle={45}
        className="-oui-translate-x-1/2 "
      />
    </button>
  );

  if (!menus) return button;
};
