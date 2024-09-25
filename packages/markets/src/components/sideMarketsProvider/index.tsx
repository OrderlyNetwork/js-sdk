import {
  FC,
  createContext,
  PropsWithChildren,
  useState,
  useContext,
} from "react";
import type { TabName } from "../expandMarkets/expandMarkets.script";
import { useLocalStorage } from "@orderly.network/hooks";

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
  // const [activeTab, setActiveTab] = useState<TabName>("all");
  const [activeTab, setActiveTab] = useLocalStorage(
    "orderly_markets_sel_tab_key",
    "all"
  );
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
