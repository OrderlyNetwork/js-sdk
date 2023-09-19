import { FC, PropsWithChildren } from "react";
import { TabTitle } from "./tab";

export interface TabPaneProps {
  title: TabTitle;
  active?: boolean;
  value?: string;
  disabled?: boolean;
}

export const TabPane: FC<PropsWithChildren<TabPaneProps>> = (props) => {
  return <div>{props.children}</div>;
};

TabPane.displayName = "TabPane";
