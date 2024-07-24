import { useMemo, useState } from "react";
import { useScaffoldContext } from "../scaffoldContext";
import { useWalletConnector } from "@orderly.network/hooks";
import { ProductItem } from "./productItem";
// import { MainNavProps } from "./mainNav.ui";

export type MainNavItem = {
  name: string;
  href: string;
};

export type MainNavProps = {
  logo: {
    src: string;
    alt: string;
  };
  mainMenus: MainNavItem[];

  products: MainNavItem[];

  initialProduct: string;
  initialMenu: string;
};

export const useMainNavBuilder = (props: Partial<MainNavProps>) => {
  const { unsupported, routerAdapter } = useScaffoldContext();
  const { connectedChain } = useWalletConnector();
  const [current, setCurrent] = useState(
    () => props?.initialMenu ?? props?.mainMenus?.[0].href ?? "/trading"
  );
  const [currentProduct, setCurrentProduct] = useState(
    () => props?.initialProduct ?? props?.products?.[0].href ?? "/swap"
  );

  const mainNavConfig = useMemo(() => {
    return {
      logo: {
        //https://mintlify.s3-us-west-1.amazonaws.com/orderly/logo/dark.png
        src: "https://testnet-dex-evm.woo.org/images/woofipro.svg",
        alt: "woofipro",
      },
      mainMenus: [
        { name: "Trading", href: "/trading" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Markets", href: "/markets" },
        { name: "Rewards", href: "/rewards" },
      ],
      products: [
        { name: "Swap", href: "/swap" },
        { name: "Perps", href: "/perps" },
      ],
      ...props,
    };
  }, [props]);

  return {
    // ...mainNavConfig,

    // currentProduct,
    logo: mainNavConfig.logo,
    products: {
      items: mainNavConfig.products,
      current: currentProduct,
      onItemClick: (product: ProductItem) => {
        setCurrentProduct(product.href);
        routerAdapter?.onRouteChange({
          href: product.href,
          name: product.name,
          scope: "product",
        });
      },
    },
    mainMenus: {
      items: mainNavConfig.mainMenus,
      /**
       * @type string
       * The current item of the router
       */
      current,
      onItemClick: (item: MainNavItem) => {
        setCurrent(item.href);
        routerAdapter?.onRouteChange({
          href: item.href,
          name: item.name,
          scope: "mainMenu",
        });
      },
    },

    isUnsupported: unsupported,
    isConnected: !!connectedChain,
  };
};

export type MainNavBuilder = ReturnType<typeof useMainNavBuilder>;
