import React, { FC } from "react";
import { cn } from "@/utils/css";

export interface TabProps {
  title: string;
  active?: boolean;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick: (value: any, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: FC<TabProps> = (props) => {
  const { active, disabled } = props;
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
      {props.title}
    </button>
  );
};
