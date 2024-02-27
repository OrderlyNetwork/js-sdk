import React, { FC, ReactNode, useRef } from "react";
import { cn } from "@/utils/css";
import { type TabContextState } from "./tabContext";
import { TabViewMode } from "./constants";

export type getTitleFunction = (context: TabContextState) => string;
export type TabTitle = ReactNode | getTitleFunction;

export interface TabProps {
  title: ReactNode;
  active?: boolean;
  value: string | number;
  disabled?: boolean;
  fullWidth?: boolean;
  mode: TabViewMode;
  icon?: React.ReactNode;
  onClick: (value: any, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: FC<TabProps> = (props) => {
  const { active, disabled, title, fullWidth, mode } = props;

  return (
    <button
      className={cn(
        "orderly-text-base-contrast-36 desktop:orderly-text-base-contrast-54 orderly-h-full orderly-tab-item orderly-min-h-[32px] orderly-relative after:orderly-hidden after:orderly-content-[''] after:orderly-absolute after:orderly-bottom-0 after:orderly-left-0 after:orderly-right-0 after:orderly-h-[3px] after:desktop:orderly-h-[2px] after:orderly-bg-base-contrast",
        active &&
          mode === TabViewMode.Tab &&
          "orderly-text-base-contrast desktop:orderly-text-base-contrast active after:orderly-block",
        disabled &&
          "orderly-cursor-not-allowed orderly-text-base-contrast-36 desktop:orderly-text-base-contrast-54",
        fullWidth && "orderly-flex-1"
      )}
      data-active={active}
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
