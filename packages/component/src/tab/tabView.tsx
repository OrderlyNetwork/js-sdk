import { TabPaneProps } from "./tabPane";

export interface TabViewProps {
  tabs: TabPaneProps[];
  onChange: (value: string) => void;
  value?: string;
}

export const TabView = () => {};
