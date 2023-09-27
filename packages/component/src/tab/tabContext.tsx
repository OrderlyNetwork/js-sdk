import { useLocalStorage } from "@orderly.network/hooks";
import React, { FC, PropsWithChildren, useCallback, useState } from "react";

export interface TabContextState {
  contentVisible: boolean;
  toggleContentVisible: () => void;
  data: any;
  updateData: (key: string, value: any) => void;
}

const TabContext = React.createContext<TabContextState>({} as TabContextState);

const TabContextProvider: FC<
  PropsWithChildren<{
    data?: any;
    collapsed: boolean;
    onToggleCollapsed?: () => void;
  }>
> = (props) => {
  // const [visible, setVisible] = useState<boolean>(() => props.collapsed);
  const [data, setData] = useState<any>(props.data || {});

  const updateData = useCallback((key: string, value: any) => {
    setData((data: any) => {
      return {
        ...data,
        [key]: value,
      };
    });
  }, []);

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

export { TabContext, TabContextProvider };
