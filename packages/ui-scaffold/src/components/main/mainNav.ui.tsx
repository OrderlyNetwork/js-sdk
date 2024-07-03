import { FC, PropsWithoutRef, useCallback, useEffect } from "react";
import { MainNavItems, MainNavItemsProps } from "./mainNavItems";

import { ProductsMenu, ProductsProps } from "./products";
import { Button, Flex, Logo, Select, Text } from "@orderly.network/ui";
import type { ChainSelectProps, LogoProps } from "@orderly.network/ui";
import { AccountMenuWidget } from "../accountMenu";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";

export type MainNavProps = MainNavItemsProps & {
  className?: string;
  logo: LogoProps;
  products: ProductsProps;
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
        <MainNavItems {...props} />
      </Flex>
      <Flex itemAlign={"center"} gap={4}>
        <AccountSummaryWidget />
        {/*<Select.chains {...chainsProps} />*/}
        <ChainMenuWidget />
        <AccountMenuWidget />
        {/*<Button*/}
        {/*  size="md"*/}
        {/*  variant="gradient"*/}
        {/*  angle={45}*/}
        {/*  className="wallet-connect-button"*/}
        {/*>*/}
        {/*  <Text.formatted rule="address" className="oui-text-[rgba(0,0,0,.88)]">*/}
        {/*    0x7fB3d51911AeF5c651355EBAa51393217e062Ec0*/}
        {/*  </Text.formatted>*/}
        {/*</Button>*/}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
