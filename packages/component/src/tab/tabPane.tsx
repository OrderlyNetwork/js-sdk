import { FC, PropsWithChildren, ReactNode } from "react";

export interface TabPaneProps {
  title: ReactNode;
  active?: boolean;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export const TabPane: FC<PropsWithChildren<TabPaneProps>> = (props) => {
  return <div>{props.children}</div>;
};

TabPane.displayName = "TabPane";
