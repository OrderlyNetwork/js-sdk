import { FC } from "react";
import { MainNavItem, NavItem } from "./navItem";
import { Flex } from "@orderly.network/ui";

export type MainNavItemsProps = {
  items?: MainNavItem[];
  current?: string;
  onItemClick?: (item: MainNavItem) => void;
};

export const MainNavItems: FC<MainNavItemsProps> = (props) => {
  return (
    <Flex gap={2}>
      {props.items?.map((item, index) => (
        <NavItem
          key={index}
          item={item}
          actived={item.href === props.current}
          onClick={props.onItemClick}
        />
      ))}
    </Flex>
  );
};
