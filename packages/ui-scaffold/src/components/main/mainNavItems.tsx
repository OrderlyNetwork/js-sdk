import { FC } from "react";
import { MainNavItem, NavItem } from "./navItem";
import { Flex } from "@orderly.network/ui";

export type MainNavItemsProps = {
  items?: MainNavItem[];
  current?: string;
  onItemClick?: (item: MainNavItem) => void;
};

export const MainNavItems: FC<MainNavItemsProps> = (props) => {
  const { items } = props;

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Flex gap={2}>
      {items?.map((item, index) => (
        <NavItem
          key={index}
          item={item}
          active={item.href === props.current}
          onClick={props.onItemClick}
        />
      ))}
    </Flex>
  );
};
