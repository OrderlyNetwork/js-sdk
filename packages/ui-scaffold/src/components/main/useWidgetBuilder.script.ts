import { useMemo, useState } from "react";
import {
  MainNavItem,
  MainNavProps,
  useScaffoldContext,
} from "../scaffoldContext";
import { useWalletConnector } from "@orderly.network/hooks";
import { ProductItem } from "./productItem";

export const useMainNavBuilder = () => {
  const { unsupported, routerAdapter, mainNavProps } = useScaffoldContext();
  const { connectedChain } = useWalletConnector();
  const [current, setCurrent] = useState(
    () => mainNavProps?.initialMenu ?? mainNavProps?.mainMenus[0].href ?? "/"
  );
  const [currentProduct, setCurrentProduct] = useState(
    () =>
      mainNavProps?.initialProduct ?? mainNavProps?.products[0].href ?? "/swap"
  );

  const mainNavConfig = useMemo(() => {
    return {
      logo: {
        //https://mintlify.s3-us-west-1.amazonaws.com/orderly/logo/dark.png
        src: "https://testnet-dex-evm.woo.org/images/woofipro.svg",
        alt: "woofipro",
      },
      mainMenus: [
        { name: "Trading", href: "/" },
        { name: "Portfolio", href: "/portfolio" },
      ],
      products: [
        { name: "Swap", href: "/swap" },
        { name: "Trade", href: "/trade" },
      ],
      ...mainNavProps,
    };
  }, [mainNavProps]);

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
