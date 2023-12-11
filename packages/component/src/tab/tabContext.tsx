import { useLocalStorage } from "@orderly.network/hooks";
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

export interface TabContextState {
  contentVisible: boolean;
  toggleContentVisible: () => void;
  data: any;
  updateData: (key: string, value: any) => void;
}

const TabContext = React.createContext<TabContextState>({} as TabContextState);

const useTabContext = () => useContext(TabContext);

const TabContextProvider: FC<
  PropsWithChildren<{
    data?: any;
    collapsed: boolean;
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

  console.log("----- tab context ----------", props.data);

  return (
    <TabContext.Provider
      value={{
        contentVisible: !props.collapsed,
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
