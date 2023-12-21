import React, { FC, PropsWithChildren, ReactNode } from "react";

export interface TabPaneProps {
  title: ReactNode;
  active?: boolean;
  value?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const TabPane: FC<PropsWithChildren<TabPaneProps>> = (props) => {
  return <div id={props.id} className={props.className}>{props.children}</div>;
};

TabPane.displayName = "TabPane";
