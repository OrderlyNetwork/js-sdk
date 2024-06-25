import React, {
  FC,
  PropsWithChildren,
  createContext,
  useEffect,
  ReactNode,
  useState,
  useContext,
  ReactElement,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { TabsBase, TabsList, TabsContent, TabsTrigger } from "./tabsBase";

type tabConfig = {
  title: ReactNode;
  icon?: ReactElement;

  value: string;
  content: ReactNode;
};

type TabsContextState = {
  // tabs:React.ReactNode[];
  registerTab: (tab: tabConfig) => void;
};

const TabsContext = createContext({} as TabsContextState);

type TabsProps<T = string> = {
  defaultValue?: T;
  value?: T;
  // onChange?: (value: T) => void;
} & TabsPrimitive.TabsProps;

const Tabs: FC<TabsProps> = (props) => {
  // const { value, onChange, defaultValue } = props;
  const [tabList, setTabList] = useState<{ [key: string]: tabConfig }>({});

  const registerTab = (config: tabConfig) => {
    setTabList((prev) => {
      return {
        ...prev,
        [config.value]: config,
      };
    });
  };

  return (
    <TabsContext.Provider
      value={{
        registerTab,
      }}
    >
      {props.children}
      <TabsBase
        {...props}
        // value={value}
        // onValueChange={onChange}
        // defaultValue={defaultValue}
      >
        <TabsList>
          {Object.keys(tabList).map((key) => {
            const tab = tabList[key];
            return (
              <TabsTrigger key={key} value={tab.value} icon={tab.icon}>
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {Object.keys(tabList).map((key) => {
          const tab = tabList[key];
          return (
            <TabsContent key={key} value={tab.value}>
              {tab.content}
            </TabsContent>
          );
        })}
      </TabsBase>
    </TabsContext.Provider>
  );
};

Tabs.displayName = "Tabs";

type TabPanelProps = {
  value: any;
  title: string | React.ReactNode;
  icon?: React.ReactElement;
};

const TabPanel: FC<PropsWithChildren<TabPanelProps>> = (props) => {
  const { title, value, icon } = props;
  const { registerTab } = useContext(TabsContext);

  useEffect(() => {
    const tabConfig = {
      title,
      value,
      icon,
      content: props.children,
    };
    registerTab(tabConfig);
  }, [props.children, title, value]);

  return null;
};

TabPanel.displayName = "TabPanel";

export { Tabs, TabPanel };
