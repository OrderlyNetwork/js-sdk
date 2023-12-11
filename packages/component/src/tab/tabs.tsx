import React, {
  ForwardedRef,
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FC, PropsWithChildren, useMemo } from "react";
import { Tab, TabProps } from "./tab";
import { TabPaneProps } from "./tabPane";
import { TabBarExtraRender, TabItem, TabList } from "./tabList";
import { TabContextProvider } from "./tabContext";
import { MemorizedTabContent, TabContent } from "./tabContent";
import { TabGroup } from "@/tab/tabGroup";
import { TabViewMode } from "./constants";
import { TabBarExtraNode } from "@/page/trading/fill/sections/datalist/tabbarExtraNode";

export interface TabsProps {
  value?: string;
  // d?: string;
  onTabChange?: (value: string) => void;
  tabBarExtra?: ReactNode | TabBarExtraRender;
  extraData?: any;
  keepAlive?: boolean;
  fullWidth?: boolean;
  // 是否显示tab指示器，default: true
  showIdentifier?: boolean;

  collapsed?: boolean;
  onToggleCollapsed?: () => void;

  tabBarClassName?: string;

  allowUngroup?: boolean;
  /**
   *
   */
  minWidth?: number;
}

// it's controlled component;
const TabsInner = (
  {
    showIdentifier = true,
    collapsed = false,
    onToggleCollapsed,
    ...props
  }: PropsWithChildren<TabsProps>,
  ref: ForwardedRef<{
    getContainer: () => HTMLDivElement;
  }>
) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState(TabViewMode.Tab);

  const [tabList, children] = useMemo(() => {
    const tabList: TabItem[] = [],
      children: ReactNode[] = [];

    React.Children.forEach(props.children, (child, index) => {
      const childElement = child as React.FunctionComponentElement<
        PropsWithChildren<TabPaneProps>
      >;

      const { displayName } = childElement.type;
      //
      if (displayName === "TabPane") {
        //   return childElement;
        const { title, value, disabled } = childElement.props;
        // const active = value === props.value;

        tabList.push({ title, value, disabled });

        // children.push(
        //   <Fragment key={index}>{childElement.props.children}</Fragment>
        // );

        children.push(childElement);
        // set active index
        // if (active) {
        //   setActiveIndex(index);
        // }
      } else {
        console.error(
          "Warning: Tabs has a child which is not a TabPane component"
        );
      }
    });

    return [tabList, children];
  }, [props.children]);

  useEffect(() => {
    const index = tabList.findIndex((tab) => {
      return tab.value === props.value;
    });

    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [props.value, tabList]);

  // const child = useMemo(() => {
  //   return children[activeIndex];
  // }, [children, activeIndex]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof props.minWidth !== "number" ||
      !props.allowUngroup ||
      children?.length === 0
    ) {
      return;
    }
    const observer = new ResizeObserver(function (entries) {
      if (Array.isArray(entries) && entries[0]) {
        const target = entries[0];

        if (
          target.contentRect.width >
          props.minWidth! * children.length! * 0.8
        ) {
          setViewMode(TabViewMode.Group);
        } else {
          setViewMode(TabViewMode.Tab);
        }
      }
    });

    observer.observe(containerRef.current!);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current!);
      }
    };
  }, [props.allowUngroup, props.minWidth, children.length]);

  useImperativeHandle(ref, () => {
    return {
      getContainer: () => containerRef.current!,
    };
  });

  console.log("-----tabs render-----");

  const tabHeader =
    viewMode === TabViewMode.Tab ? (
      <TabList
        mode={viewMode}
        tabs={tabList}
        onTabChange={props.onTabChange}
        value={props.value}
        tabBarExtra={props.tabBarExtra}
        showIdentifier={showIdentifier}
        className={props.tabBarClassName}
        fullWidth={props.fullWidth}
      />
    ) : (
      <TabGroup tabList={tabList} className={props.tabBarClassName} />
    );

  return (
    <TabContextProvider
      data={props.extraData}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
    >
      <div ref={containerRef} className="orderly-min-h-0">
        {tabHeader}
        {/* <TabList
          mode={viewMode}
          tabs={tabList}
          onTabChange={props.onTabChange}
          value={props.value}
          tabBarExtra={props.tabBarExtra}
          showIdentifier={showIdentifier}
          className={props.tabBarClassName}
          fullWidth={props.fullWidth}
        /> */}
        <MemorizedTabContent
          mode={viewMode}
          activeIndex={activeIndex}
          tabs={children}
          keepAlive={props.keepAlive}
        />
      </div>
    </TabContextProvider>
  );
};

export const Tabs = forwardRef(TabsInner);
