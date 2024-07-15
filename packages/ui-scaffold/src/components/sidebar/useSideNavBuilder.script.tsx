import React from "react";
import { useMemo, useState } from "react";
import { SideBarProps } from "./sidebar.ui";
import { useScaffoldContext } from "../scaffoldContext";

export const useSideNavBuilder = (
  props?: Partial<SideBarProps>
): SideBarProps => {
  const [current, setCurrent] = useState("/");
  const { expanded, setExpand } = useScaffoldContext();

  if (typeof setExpand === "undefined") {
    console.warn("SideBar component must be used within a Scaffold component");
  }

  return {
    items: [],
    current,
    open: expanded,
    onOpenChange: (open) => {
      setExpand?.(open);
    },
    onItemSelect: (item) => {
      if (item.href) {
        setCurrent(item.href);
      }
    },
    ...props,
  };
};
