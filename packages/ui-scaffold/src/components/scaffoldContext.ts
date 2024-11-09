import { createContext, useContext } from "react";
import { FooterConfig } from "./footer";

export type RouteOption = {
  href: string;
  name: string;
  scope?: string;
  target?: string;
};

export type routerAdapter = {
  onRouteChange: (option: RouteOption) => void;
  currentPath?: string;
};

export type ExpandableState = {
  routerAdapter?: routerAdapter;
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  // unsupported: boolean;
  checkChainSupport: (chainId: number | string) => boolean;
  footerConfig?: FooterConfig;
};

export const ExpandableContext = createContext<ExpandableState>(
  {} as ExpandableState
);

export const useScaffoldContext = () => {
  return useContext(ExpandableContext);
};
