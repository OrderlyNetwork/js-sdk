import React, { FC, PropsWithChildren, useState } from "react";

export interface TabContextValue {
  contentVisible: boolean;
  toggleContentVisible: () => void;
}

const TabContext = React.createContext<TabContextValue>({
  contentVisible: true,
  toggleContentVisible: () => {},
});

const TabContextProvider: FC<PropsWithChildren> = (props) => {
  const [visible, setVisible] = useState(true);
  return (
    <TabContext.Provider
      value={{
        contentVisible: visible,
        toggleContentVisible: () => {
          console.log("toggleContentVisible");
          setVisible((visible) => !visible);
        },
      }}
    >
      {props.children}
    </TabContext.Provider>
  );
};

export { TabContext, TabContextProvider };
