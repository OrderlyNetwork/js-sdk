import React, { FC, ReactNode, useRef } from "react";
import { cn } from "@/utils/css";
import { type TabContextState } from "./tabContext";

export type getTitleFunction = (context: TabContextState) => string;
export type TabTitle = ReactNode | getTitleFunction;

export interface TabProps {
  title: ReactNode;
  active?: boolean;
  value: string | number;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onClick: (value: any, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: FC<TabProps> = (props) => {
  const { active, disabled, title, fullWidth } = props;
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      className={cn(
        "orderly-text-base-contrast-36 orderly-h-full orderly-tab-item",
        active && "orderly-text-base-contrast orderly-active",
        disabled && "orderly-cursor-not-allowed orderly-text-slate-300",
        fullWidth && "orderly-flex-1"
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
