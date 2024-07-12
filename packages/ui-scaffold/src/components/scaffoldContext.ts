import { createContext, useContext } from "react";
import { FooterConfig } from "./footer";

export type ExpandableState = {
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  unsupported: boolean;
  checkChainSupport: (chainId: number | string) => boolean;
  footerConfig?: FooterConfig
};

export const ExpandableContext = createContext<ExpandableState>(
  {} as ExpandableState
);

export const useScaffoldContext = () => {
  return useContext(ExpandableContext);
};
