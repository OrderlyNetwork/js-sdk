import { Flex } from "../../flex";
import { FC, useCallback, useEffect } from "react";
import { MainNavItems, MainNavItemsProps } from "./mainNavItems";
import { Button } from "../../button";
import { ChainSelect } from "../../select/chains";
import { Text } from "../../typography";
import { TotalValue } from "./totalValue";
import { Logo, LogoProps } from "../../logo/logo";
import { ProductsMenu, ProductsProps } from "./products";

export type MainNavProps = MainNavItemsProps & {
  className?: string;
  logo: LogoProps;
  products: ProductsProps;
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
        <TotalValue />
        <ChainSelect
          size="lg"
          currentChain={{
            name: "",
            id: "",
            bridgeless: false,
          }}
          onChange={function (chain: string): void {
            throw new Error("Function not implemented.");
          }}
          chains={[]}
        />
        <Button
          size="md"
          variant="gradient"
          angle={45}
          className="wallet-connect-button"
        >
          <Text.formatted rule="address" className="oui-text-[rgba(0,0,0,.88)]">
            0x7fB3d51911AeF5c651355EBAa51393217e062Ec0
          </Text.formatted>
        </Button>
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
