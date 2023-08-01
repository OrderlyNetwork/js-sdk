import React, { FC, PropsWithChildren, useState } from "react";

export interface TabContextState {
  contentVisible: boolean;
  toggleContentVisible: () => void;
}

const TabContext = React.createContext<TabContextState>({} as TabContextState);

const TabContextProvider: FC<PropsWithChildren> = (props) => {
  const [visible, setVisible] = useState(true);
  return (
    <TabContext.Provider
      value={{
        contentVisible: visible,
        toggleContentVisible: () => {
          setVisible((visible) => !visible);
        },
      }}
    >
      {props.children}
    </TabContext.Provider>
  );
};

export { TabContext, TabContextProvider };
