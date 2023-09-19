import React, { FC, PropsWithChildren, useCallback, useState } from "react";

export interface TabContextState {
  contentVisible: boolean;
  toggleContentVisible: () => void;
  data: any;
  updateData: (key: string, value: any) => void;
}

const TabContext = React.createContext<TabContextState>({} as TabContextState);

const TabContextProvider: FC<PropsWithChildren<{ data?: any }>> = (props) => {
  const [visible, setVisible] = useState(true);
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
        contentVisible: visible,
        toggleContentVisible: () => {
          setVisible((visible) => !visible);
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
