import React, { FC, PropsWithChildren, memo, useContext, useMemo } from "react";
import { TabContext, useTabContext } from "./tabContext";
import { cn } from "@/utils/css";
import { TabViewMode } from "./constants";

export interface TabContentProps {
  keepAlive?: boolean;
  tabs?: any[];
  activeIndex?: number;
  mode: TabViewMode;
}

export const TabContent: FC<PropsWithChildren<TabContentProps>> = (props) => {
  const { keepAlive, activeIndex, tabs, mode } = props;
  const { contentVisible } = useTabContext();
  // const contentVisible = true;

  const children = useMemo(() => {
    if (!tabs) return null;
    if (!keepAlive) {
      return tabs[activeIndex ?? 0];
    }

    return tabs.map((tab, index) => {
      return (
        <div
          key={index}
          className={cn(
            "orderly-h-full orderly-w-full orderly-transition-all orderly-min-w-0",
            mode === TabViewMode.Tab
              ? index === activeIndex
                ? "orderly-inset-0"
                : "orderly-hidden"
              : "orderly-border-l orderly-border-divider first:orderly-border-l-0"
          )}
        >
          {tab}
        </div>
      );
    });
  }, [activeIndex, keepAlive, tabs, mode]);

  const layout = useMemo<any>(() => {
    return { height: "200px" };
  }, []);

  return (
    <div
      className={cn(
        "orderly-transition-all orderly-grid",
        contentVisible ? "orderly-grid-rows-[1fr]" : "orderly-grid-rows-[0fr]"
      )}
      // onTransitionEnd={() => {
      //
      // }}
    >
      <div
        className={cn(
          "orderly-overflow-hidden orderly-relative",
          mode === TabViewMode.Group && "orderly-grid"
        )}
        style={
          mode === TabViewMode.Group
            ? {
                gridTemplateColumns: `repeat(${props.tabs?.length}, 1fr)`,
                ...layout,
              }
            : layout
        }
      >
        {children}
      </div>
    </div>
  );
};

export const MemorizedTabContent = memo(TabContent);
