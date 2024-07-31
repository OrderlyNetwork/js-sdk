import {
  FC,
  PropsWithChildren,
  PropsWithoutRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  MainNavClassNames,
  MainNavItems,
  MainNavItemsProps,
} from "./mainNavItems";

import { ProductsMenu, ProductsProps } from "./products";
import { Button, Flex, Logo, Select, Text } from "@orderly.network/ui";
import type { ChainSelectProps, LogoProps } from "@orderly.network/ui";
import { AccountMenuWidget } from "../accountMenu";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";
import { cn } from "@orderly.network/ui";

export type MainNavProps = {
  className?: string;
  logo: LogoProps;
  products: ProductsProps;
  mainMenus: MainNavItemsProps;
  wrongNetwork: boolean;
  isConnected: boolean;
  classNames?: {
    root?: string;
    mainNav?: MainNavClassNames;
    // subNav?: string;
    logo?: string;
    products?: string;
    account?: string;
    chains?: string;
  };
};

export const MainNav: FC<PropsWithChildren<MainNavProps>> = (props) => {
  const { className, logo, products, classNames } = props;

  const children = useMemo(() => {
    if (typeof props.children === "undefined") return null;

    return <Flex grow>{props.children}</Flex>;
  }, [props.children]);

  return (
    <Flex
      as="header"
      itemAlign={"center"}
      height={"48px"}
      justify={"between"}
      px={3}
      className={`orderly-main-nav ${className} ${classNames?.root} oui-font-semibold`}
    >
      <Flex itemAlign={"center"} gap={4}>
        <Logo {...logo} />
        <ProductsMenu {...products} className={classNames?.products} />
        <MainNavItems {...props.mainMenus} classNames={classNames?.mainNav} />
      </Flex>
      {children}

      <Flex itemAlign={"center"} gap={4}>
        <AccountSummaryWidget />
        <ChainMenuWidget />
        {props.wrongNetwork && props.isConnected ? null : <AccountMenuWidget />}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
