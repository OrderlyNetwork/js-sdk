import { useMemo, useState } from "react";
import { useScaffoldContext } from "../scaffoldContext";
import { useWalletConnector } from "@orderly.network/hooks";
import { ProductItem } from "./productItem";
import { useAppContext } from "@orderly.network/react-app";
import type { MainNavItem } from "./navItem";

export type MainNavProps = {
  logo: {
    src: string;
    alt: string;
  };
  mainMenus: MainNavItem[];

  products: MainNavItem[];

  initialProduct: string;
  /**
   * initial menu path, if it has submenus, use array
   * @type string | string[]
   */
  initialMenu: string | string[];
};

export const useMainNavBuilder = (props: Partial<MainNavProps>) => {
  const { routerAdapter } = useScaffoldContext();
  const { connectedChain } = useWalletConnector();
  const { wrongNetwork } = useAppContext();
  const [current, setCurrent] = useState(() => {
    if (typeof props.initialMenu === "undefined") return [];

    return !Array.isArray(props.initialMenu)
      ? [props.initialMenu]
      : props.initialMenu;
  });
  const [currentProduct, setCurrentProduct] = useState(
    () => props?.initialProduct ?? props?.products?.[0].href ?? ""
  );

  const mainNavConfig = useMemo(() => {
    return {
      logo: {
        //https://mintlify.s3-us-west-1.amazonaws.com/orderly/logo/dark.png
        src: "https://testnet-dex-evm.woo.org/images/woofipro.svg",
        alt: "woofipro",
      },
      mainMenus: [
        // { name: "Trading", href: "/trading" },
        // { name: "Portfolio", href: "/portfolio" },
        // { name: "Markets", href: "/markets" },
        // { name: "Rewards", href: "/rewards" },
      ],
      products: [
        // { name: "Swap", href: "/swap" },
        // { name: "Perps", href: "/perps" },
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
      onItemClick: (item: MainNavItem[]) => {
        setCurrent(item.map((item) => item.href));

        const current = item[item.length - 1];
        routerAdapter?.onRouteChange({
          href: current.href,
          name: current.name,
          scope: "mainMenu",
        });
      },
    },

    isConnected: !!connectedChain,
    wrongNetwork,
  };
};

export type MainNavBuilder = ReturnType<typeof useMainNavBuilder>;
