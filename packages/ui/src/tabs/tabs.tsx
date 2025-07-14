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
import { cnBase, VariantProps } from "tailwind-variants";
import { Flex } from "../flex";
import { useOrderlyTheme } from "../provider/orderlyThemeProvider";
import { ScrollIndicator } from "../scrollIndicator";
import {
  TabsBase,
  TabsList,
  TabsContent,
  TabsTrigger,
  tabsVariants,
} from "./tabsBase";

type tabConfig = {
  title: ReactNode;
  icon?: ReactElement;
  testid?: string;

  value: string;
  content: ReactNode;
  collapsed?: boolean;
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
  leading?: ReactNode;
  trailing?: ReactNode;
  classNames?: {
    tabsListContainer?: string;
    tabsList?: string;
    tabsContent?: string;
    scrollIndicator?: string;
    trigger?: string;
  };
  contentVisible?: boolean;
  showScrollIndicator?: boolean;
} & TabsPrimitive.TabsProps &
  VariantProps<typeof tabsVariants>;

const Tabs: FC<TabsProps> = (props) => {
  const { getComponentTheme } = useOrderlyTheme();
  const {
    classNames,
    contentVisible = true,
    variant,
    showScrollIndicator,
    ...rest
  } = props;

  const tabsOverrides = getComponentTheme("tabs", {
    variant: "contained",
  });

  const tabsVariant = variant || tabsOverrides.variant;

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

  const renderTabsList = () => {
    const tabsList = (
      <TabsList
        variant={tabsVariant}
        size={rest.size}
        className={cnBase("oui-flex-1 oui-border-0", classNames?.tabsList)}
      >
        {Object.keys(tabList).map((key) => {
          const tab = tabList[key];
          return (
            <TabsTrigger
              key={key}
              value={tab.value}
              icon={tab.icon}
              variant={tabsVariant}
              size={rest.size}
              data-testid={tab.testid}
              className={classNames?.trigger}
            >
              {tab.title}
            </TabsTrigger>
          );
        })}
      </TabsList>
    );

    if (showScrollIndicator) {
      return (
        <ScrollIndicator className={classNames?.scrollIndicator}>
          {tabsList}
        </ScrollIndicator>
      );
    }

    return tabsList;
  };

  return (
    <TabsContext.Provider
      value={{
        registerTab,
      }}
    >
      {props.children}
      <TabsBase {...rest}>
        <Flex
          justify="between"
          itemAlign="center"
          width="100%"
          className={cnBase(
            tabsVariant !== "contained" && "oui-border-b oui-border-b-line-6",
            classNames?.tabsListContainer,
          )}
        >
          {props.leading}
          {renderTabsList()}
          {props.trailing}
        </Flex>

        {contentVisible &&
          Object.keys(tabList).map((key) => {
            const tab = tabList[key];
            return (
              <TabsContent
                key={key}
                value={tab.value}
                className={classNames?.tabsContent}
              >
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
  testid?: string;
};

const TabPanel: FC<PropsWithChildren<TabPanelProps>> = (props) => {
  const { title, value, icon, testid } = props;
  const { registerTab } = useContext(TabsContext);

  useEffect(() => {
    const tabConfig = {
      title,
      value,
      icon,
      testid,
      content: props.children,
    };
    registerTab(tabConfig);
  }, [props.children, title, value]);

  return null;
};

TabPanel.displayName = "TabPanel";

export { Tabs, TabPanel };
