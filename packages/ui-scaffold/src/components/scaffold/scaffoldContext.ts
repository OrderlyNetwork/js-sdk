import { createContext, useContext } from "react";

export type RouteOption = {
  href: string;
  name: string;
  scope?: string;
  target?: string;
};

export type RouterAdapter = {
  onRouteChange: (option: RouteOption) => void;
  currentPath?: string;
};

export type ScaffoldState = {
  routerAdapter?: RouterAdapter;
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  checkChainSupport: (chainId: number | string) => boolean;
  topNavbarHeight: number;
  footerHeight: number;
  announcementHeight: number;
};

export const ScaffoldContext = createContext<ScaffoldState>(
  {} as ScaffoldState
);

export const useScaffoldContext = () => {
  return useContext(ScaffoldContext);
};
