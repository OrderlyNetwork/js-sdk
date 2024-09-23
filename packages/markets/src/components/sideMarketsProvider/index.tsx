import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
} from "react";
import type { TabName } from "../expandMarkets/expandMarkets.script";

type SideMarketsContextState = {
  activeTab?: TabName;
  onTabChange?: (tab: TabName) => void;
  /** current tab data source */
  currentDataSource?: any[];
  setCurrentDataSource?: (data: any[]) => void;
};

export const SideMarketsContext = createContext({} as SideMarketsContextState);

export type SideMarketsProviderProps = PropsWithChildren<any>;

export const SideMarketsProvider: FC<SideMarketsProviderProps> = (props) => {
  const [activeTab, setActiveTab] = useState<TabName>("favorites");
  const [currentDataSource, setCurrentDataSource] = useState([] as any[]);

  return (
    <SideMarketsContext.Provider
      value={{
        activeTab,
        onTabChange: setActiveTab,
        currentDataSource,
        setCurrentDataSource,
      }}
    >
      {props.children}
    </SideMarketsContext.Provider>
  );
};

export function useSideMarketsContext() {
  return useContext(SideMarketsContext);
}
