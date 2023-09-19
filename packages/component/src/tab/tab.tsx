import React, { FC, useContext, useMemo } from "react";
import { cn } from "@/utils/css";
import { TabContext, type TabContextState } from "./tabContext";

export type getTitleFunction = (context: TabContextState) => string;
export type TabTitle = string | getTitleFunction;

export interface TabProps {
  title: TabTitle;
  active?: boolean;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick: (value: any, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: FC<TabProps> = (props) => {
  const { active, disabled } = props;
  const tabContext = useContext(TabContext);
  const title = useMemo(() => {
    if (typeof props.title === "string") {
      return props.title;
    }
    if (typeof props.title === "function") {
      return props.title(tabContext);
    }
  }, [props.title]);
  return (
    <button
      className={cn(
        "mx-3 text-base-contrast/40 h-[32px]",
        active && "text-base-contrast active",
        disabled && "cursor-not-allowed text-slate-300"
      )}
      disabled={props.disabled}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick(props.value, event);
      }}
      id={`tab-${props.value}`}
    >
      {title}
    </button>
  );
};
