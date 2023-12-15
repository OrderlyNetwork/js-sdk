import { useLocalStorage } from "@orderly.network/hooks";
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface TabContextState {
  contentVisible: boolean;
  toggleContentVisible: () => void;
  data: any;
  updateData: (key: string, value: any) => void;

  height?: TabRect;
}

const TabContext = React.createContext<TabContextState>({} as TabContextState);

const useTabContext = () => useContext(TabContext);

export type TabRect = { box: number; header: number; content: number };

const TabContextProvider: FC<
  PropsWithChildren<{
    data?: any;
    collapsed: boolean;
    height?: TabRect;
    onToggleCollapsed?: () => void;
  }>
> = (props) => {
  // const [visible, setVisible] = useState<boolean>(() => props.collapsed);
  const [data, setData] = useState<any>(props.data || {});
  // const data = {};

  const updateData = useCallback((key: string, value: any) => {
    // console.log("update data", key, value);
    setData((data: any) => {
      return {
        ...data,
        [key]: value,
      };
    });
  }, []);

  // console.log("----- tab context ----------", props.data, props.height);

  return (
    <TabContext.Provider
      value={{
        contentVisible: !props.collapsed,
        height: props.height,
        toggleContentVisible: () => {
          // setVisible((visible: boolean) => !visible);
          props.onToggleCollapsed?.();
        },
        data,
        updateData,
      }}
    >
      {props.children}
    </TabContext.Provider>
  );
};

export { TabContext, useTabContext, TabContextProvider };
