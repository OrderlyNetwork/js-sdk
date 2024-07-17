import { createContext, useContext } from "react";
import { FooterConfig } from "./footer";

export type routerAdapter = {
  onRouteChange: (options: {
    href: string;
    name: string;
    scope?: string;
  }) => void;
  currentPath: string;
};

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

export type ExpandableState = {
  routerAdapter?: routerAdapter;
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  unsupported: boolean;
  checkChainSupport: (chainId: number | string) => boolean;
  footerConfig?: FooterConfig;
  // ---------- main nav props ------------
  mainNavProps?: MainNavProps;
};

export const ExpandableContext = createContext<ExpandableState>(
  {} as ExpandableState
);

export const useScaffoldContext = () => {
  return useContext(ExpandableContext);
};
