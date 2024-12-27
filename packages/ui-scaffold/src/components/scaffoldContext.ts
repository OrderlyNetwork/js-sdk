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

export type ExpandableState = {
  routerAdapter?: RouterAdapter;
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  checkChainSupport: (chainId: number | string) => boolean;
};

export const ExpandableContext = createContext<ExpandableState>(
  {} as ExpandableState
);

export const useScaffoldContext = () => {
  return useContext(ExpandableContext);
};
