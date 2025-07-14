import { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { MainNavItem, NavItem } from "./mainMenus/navItem";

export type MainNavClassNames = {
  root?: string;
  navItem?: string;
  subMenu?: string;
};

export type MainNavItemsProps = {
  items?: MainNavItem[];
  current?: string[];
  classNames?: MainNavClassNames;
  onItemClick?: (item: MainNavItem[]) => void;
};

export const MainNavItems: FC<MainNavItemsProps> = (props) => {
  const { items, classNames } = props;

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Flex gap={2} className={classNames?.root}>
      {items?.map((item, index) => (
        <NavItem
          key={index}
          item={item}
          // active={item.href === props.current?.[0]}
          currentPath={props.current}
          onClick={props.onItemClick}
        />
      ))}
    </Flex>
  );
};
