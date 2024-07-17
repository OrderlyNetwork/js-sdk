import { FC, PropsWithoutRef, useCallback, useEffect } from "react";
import { MainNavItems, MainNavItemsProps } from "./mainNavItems";

import { ProductsMenu, ProductsProps } from "./products";
import { Button, Flex, Logo, Select, Text } from "@orderly.network/ui";
import type { ChainSelectProps, LogoProps } from "@orderly.network/ui";
import { AccountMenuWidget } from "../accountMenu";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";

export type MainNavProps = {
  className?: string;
  logo: LogoProps;
  products: ProductsProps;
  mainMenus: MainNavItemsProps;
  // currentProduct: string;
  isUnsupported: boolean;
  isConnected: boolean;
  // chainsProps: ChainSelectProps;
};

export const MainNav: FC<MainNavProps> = (props) => {
  const { className, logo, products } = props;
  return (
    <Flex
      as="header"
      itemAlign={"center"}
      height={"48px"}
      justify={"between"}
      px={3}
      className={`orderly-main-nav ${className}`}
    >
      <Flex itemAlign={"center"} gap={4}>
        <Logo {...logo} />
        <ProductsMenu {...products} />
        <MainNavItems {...props.mainMenus} />
      </Flex>
      <Flex itemAlign={"center"} gap={4}>
        <AccountSummaryWidget />
        <ChainMenuWidget />
        {props.isUnsupported && props.isConnected ? null : (
          <AccountMenuWidget />
        )}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
