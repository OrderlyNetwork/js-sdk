import { FC, PropsWithChildren } from "react";

export interface TabPaneProps {
  title: string;
  active?: boolean;
  value?: string;
  disabled?: boolean;
}

export const TabPane: FC<PropsWithChildren<TabPaneProps>> = (props) => {
  return <div>TabPane</div>;
};

TabPane.displayName = "TabPane";
