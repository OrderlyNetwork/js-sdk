import { createContext, useContext } from "react";

export type ExpandableState = {
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
};

export const ExpandableContext = createContext<ExpandableState>(
  {} as ExpandableState
);

export const useScaffoldContext = () => {
  return useContext(ExpandableContext);
};
