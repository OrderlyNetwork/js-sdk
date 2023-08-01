import React, { FC } from "react";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface TabProps {
  title: string;
  active?: boolean;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick: (value: string, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: FC<TabProps> = (props) => {
  const { active, disabled } = props;
  return (
    <button
      className={twMerge(
        cx(
          "mx-2 text-slate-400",
          active && "text-slate-900 active",
          disabled && "cursor-not-allowed text-slate-300"
        )
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
